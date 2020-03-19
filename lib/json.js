var cfenv = require('cfenv')
var jsyaml = require('js-yaml')
var ea = require('ensure-array')
var lodashGet = require('lodash.get')

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

function resolve(main, secondaries, start, end, isDefault) {
    var resolveCount = 0
    var unresolved = []

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

                if (value === match) {
                    unresolved.push(match)
                } else {
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

    function parse(data) {
        if (typeof data === 'object' && data !== null) {
            for (var key in data) {
                data[key] = parse(data[key])
            }
            return data
        } else if (match(data, start, end)) {
            return replace(data)
        } else {
            return data
        }
    }

    var parsed = (function search(data) {
        data = parse(data, replace)

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

function json(main, secondaries, start, end) {
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

    if(typeof secondaries === 'object' && secondaries !== null) {
        secondaries = ea(secondaries).map(function(e) {
            return resolve(parseFormat(e), null, start, end)
        })
    }

    return resolve(main, secondaries, start, end)
}

module.exports = json
