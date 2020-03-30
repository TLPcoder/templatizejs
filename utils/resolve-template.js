var cfenv = require('cfenv')
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

function resolveEnvValue(path, match) {
    if (path.startsWith('process')) {
        return get(path.slice(8), match, process)
    } else if(path.startsWith('vcap')) {
        if (path.startsWith('vcap.services')) {
            return get(path.slice(14), match, appEnv.getServices())
        } else if(path.startsWith('vcap.application')) {
            return get(path.slice(17), match, appEnv.app)
        }
    }

    return match
}

function traverseFallback(data, replace) {
    return data(replace)
}

function resolve(traverse) {
    if (!traverse) {
        traverse = traverseFallback
    }

    return function resolver(main, secondaries, start, end, isDefault) {
        var resolveCount = 0

        function replace(str) {
            var stack = []

            for(var i = 0; i < str.length; i++) {
                if (str.slice(i, i + start.length) === start) {
                    stack.push(i)
                }

                if (str.slice(i, i + end.length) === end) {
                    var match = str.slice(stack.pop(), i + end.length)
                    var path = getPath(match, start, end)
                    var value = get(path, match, main, secondaries)

                    if (value === match && isNode) {
                        value = resolveEnvValue(path, match)
                    }

                    if (isDefault && match.includes(':')) {
                        value = removeTemplateChars(
                            match.slice(match.indexOf(':') + 1), start, end
                        ).trim()
                    }

                    if (value !== match) {
                        resolveCount++
                        if (str === match) return value
                        if (typeof value === 'object') return value
                        else {
                            str = str.replace(match, value)
                            if (stack.length) {
                                i = stack[stack.length - 1]
                            }
                        }
                    }
                }
            }

            return str
        }

        var parsed = (function repeat(data) {
            data = traverse(data, replace, start, end)

            if (resolveCount > 0) {
                resolveCount = 0
                return repeat(data, replace)
            } else return data
        })(main)

        return !isDefault
            ? resolver(main, secondaries, start, end, true)
            : parsed
    }
}

module.exports = resolve
