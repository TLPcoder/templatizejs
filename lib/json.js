var fs = require('fs')
var path = require('path')
var cfenv = require('cfenv')
var jsyaml = require('js-yaml')
var ea = require('ensure-array')
var lodashGet = require('lodash.get')
var Promise = require('bluebird').Promise

var _ = { get: lodashGet }

var isNode
var appEnv

if (process !== undefined) {
    isNode = true
}

if (isNode) {
    appEnv = cfenv.getAppEnv()
}

function parseFormat(config) {
    if (typeof config === 'object' && config !== null) {
        return config
    }

    try {
        return JSON.parse(config)
    } catch (error) {
        try {
            return jsyaml.safeLoad(config)
        } catch (_) {
            throw error
        }
    }
}

function match(str, start, end) {
    var hasStart = false

    for (var i = 0; i < str.length; i++) {
        if (str.slice(i, i + start.length) === start) {
            hasStart = true
        }

        if (str.slice(i, i + end.length) === end && hasStart) {
            return true
        }
    }

    return false
}

function removeTemplateChars(match, start, end) {
    var str = ''

    for(var i = 0; i < match.length; i++) {
        if (match.slice(i, i + start.length) === start) {
            i = i + start.length - 1
        } else if (match.slice(i, i + end.length) === end) {
            i = i + end.length - 1
        } else {
            str += match[i]
        }
    }

    return str
}

function getPath(match, start, end) {
    var hasDefault = match.indexOf(':')
    if (hasDefault !== -1) {
        return match.slice(start.length, hasDefault).trim()
    } else {
        return match.slice(start.length, match.length - end.length).trim()
    }
}

function get(path, match, main, secondaries) {
    var value = _.get(main, path, match)

    if (value !== match) {
        return value
    }

    if (secondaries) {
        for (var i = 0; i < secondaries.length; i++) {
            value = _.get(secondaries[i], path, match)

            if (value !== match) {
                return value
            }
        }
    }

    return match
}

function parse(data, action, start, end) {
    function parser(data) {
        if (typeof data === 'object' && data !== null) {
            for (var key in data) {
                data[key] = parser(data[key])
            }
            return data
        } else if (typeof data === 'string' && match(data, start, end)) {
            return action(data)
        } else {
            return data
        }
    }

    return parser(data)
}

function resolve(main, secondaries, start, end, isDefault) {
    var resolveCount = 0

    function replace(str) {
        var stack = []
        var queue = []

        for(var i = 0; i < str.length; i++) {
            if (str.slice(i, i + start.length) === start) {
                stack.push(i)
            }

            if (str.slice(i, i + end.length) === end) {
                var match = str.slice(stack.pop(), i + end.length)
                var path = getPath(match, start, end)
                var value = get(path, match, main, secondaries)

                if (value === match) {
                    if (isNode) {
                        if (isNode && path.startsWith('process')) {
                            value = get(path.slice(8), match, process)
                        } else if(isNode && path.startsWith('vcap')) {
                            if (path.startsWith('vcap.services')) {
                                value = get(path.slice(14), match, appEnv.getServices())
                            } else if(path.startsWith('vcap.application')) {
                                value = get(path.slice(17), match, appEnv.app)
                            }
                        }
                    }
                }

                if (isDefault && match.includes(':')) {
                    value = removeTemplateChars(
                        match.slice(match.indexOf(':') + 1), start, end
                    ).trim()
                }

                if (value !== match) {
                    resolveCount++
                    if (str === match) return value
                    if (typeof value === 'object') {
                        return value
                    } else {
                        queue.push({
                            match: match,
                            value: value
                        })
                    }
                }
            }
        }

        var cur

        while(queue.length) {
            cur = queue.shift()

            value = cur.value
            match = cur.match

            str = str.replace(match, value)
        }

        return str
    }

    var parsed = (function search(data) {
        data = parse(data, replace, start, end)

        if (resolveCount > 0) {
            resolveCount = 0
            return search(data, replace)
        } else {
            return data
        }
    })(main)

    return !isDefault
        ? resolve(main, secondaries, start, end, true)
        : parsed
}

function normalize(main, secondaries, start, end) {
    main = parseFormat(main)

    if (secondaries) {
        try {
            secondaries = parseFormat(secondaries)
        // eslint-disable-next-line no-empty
        } catch(_err) { }
    }

    if (typeof secondaries === 'string') {
        if (typeof start === 'string') {
            end = start
            start = secondaries
            secondaries = null
        } else {
            start = secondaries
            secondaries = null
        }
    }

    if (!start) {
        start = '{{'
    }

    if (!end) {
        end = '}}'
    }

    if (!secondaries) {
        secondaries = null
    }

    if(typeof secondaries === 'object' && secondaries !== null) {
        secondaries = ea(secondaries).map(function(e) {
            return resolve(parseFormat(e), null, start, end)
        })
    }

    return [ main, secondaries, start, end ]
}

function normalizeWithFiles(main, secondaries, start, end) {
    if (typeof main === 'string') {
        return readFile(main).then(function(file) {
            main = file
        }).then(resolveSecondary).then(function() {
            return normalize(main, secondaries, start, end)
        })
    }

    return resolveSecondary().then(function () {
        return normalize(main, secondaries, start, end)
    })

    function resolveSecondary() {
        if (
            secondaries instanceof Array ||
            typeof secondaries === 'string'
        ) {
            var paths = ea(secondaries).map(function(f) {
                return typeof f === 'string'
                    ? readFile(f)
                    : Promise.resolve(f)
            })
    
            return Promise.all(paths).then(function(files) {
                secondaries = files
            }).catch(function(_err) {
                Promise.resolve()
            })
        } else {
            return Promise.resolve()
        }
    }
}

function normalizeWithFilesSync(main, secondaries, start, end) {
    if (typeof main === 'string') {
        main = readFileSync(main)
    }

    resolveSecondary()

    return normalize(main, secondaries, start, end)

    function resolveSecondary() {
        if (
            secondaries instanceof Array ||
            typeof secondaries === 'string'
        ) {
            try {
                secondaries = ea(secondaries).map(function(f) {
                    return typeof f === 'string' ? readFileSync(f) : f
                }) 
            } catch(_err) {}
        }
    }
}

function resolvePath(p) {
    return __dirname + '/' + path.relative(__dirname, p)
}

function readFile(path) {
    return new Promise(function(resolve, reject) {
        fs.readFile(resolvePath(path), 'utf8', function(err, file) {
            if(err) reject(err)
            else resolve(file)
        })
    })
}

function writeFile(path, data) {
    return new Promise(function(resolve, reject) {
        fs.writeFile(resolvePath(path), data, 'utf8', function(err) {
            if(err) reject(err)
            else resolve()
        })
    })
}

function readFileSync(path) {
    return fs.readFileSync(resolvePath(path), 'utf8')
}

function writeFileSync(path, data) {
    return fs.writeFileSync(resolvePath(path), data, 'utf8')
}

function unresolved() {
    var args = normalize.apply(null, arguments)

    var main = args[0]
    var start = args[2]
    var end = args[3]

    var templates = []

    function action(template) {
        templates.push(template)
        return template
    }

    parse(main, action, start, end)

    return templates
}

function json() {
    var args = normalize.apply(null, arguments)

    return resolve.apply(null, args)
}

function jsonUnresolved() {
    var args = normalize.apply(null, arguments)
    var resolved = json.apply(null, arguments)
    var start = args[2]
    var end = args[3]

    var unresolvedTemplates = unresolved(resolved, start, end)

    return [ resolved, unresolvedTemplates ]
}

function jsonReadFile(main, secondaries, start, end) {
    return normalizeWithFiles(main, secondaries, start, end)
        .then(function(args) {
            main = args[0]
            secondaries = args[1]
            start = args[2]
            end = args[3]
        }).then(function() {
            return resolve(main, secondaries, start, end)
        })
}

function jsonReadFileSync() {
    var args = normalizeWithFilesSync.apply(null, arguments)
    var main = args[0]
    var secondaries = args[1]
    var start = args[2]
    var end = args[3]

    return resolve(main, secondaries, start, end)
}

function jsonWriteFile(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    return jsonReadFile.apply(null, args)
        .then(function (result) {
            return writeFile(writeTo, JSON.stringify(result, null, 4))
                .then(function() {
                    return result
                })
        })
}

function jsonWriteFileSync(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    var result = jsonReadFileSync.apply(null, args)

    writeFileSync(writeTo, JSON.stringify(result, null, 4))

    return result
}

json.unresolved = jsonUnresolved
json.readFile = jsonReadFile
json.readFileSync = jsonReadFileSync
json.writeFile = jsonWriteFile
json.writeFileSync = jsonWriteFileSync

module.exports = json
