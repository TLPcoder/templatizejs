var set = require('lodash.set')

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

function traverse(data, action, start, end) {
    var visited = new Map()
    var currentPath = ''

    function search(data) {
        if (typeof data === 'object' && data !== null) {
            if (visited.has(data)) {
                data = visited.get(data)
            } else {
                visited.set(data, data)

                for (var key in data) {
                    currentPath += currentPath.length ? '.' + key : key
                    data[key] = search(data[key])
                    currentPath = currentPath.slice(0, -(key.length + 1))
                }
            }

            return data
        } else if (typeof data === 'string' && match(data, start, end)) {
            return action(data, currentPath)
        } else {
            return data
        }
    }

    return search(data)
}

module.exports = traverse
