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
    var references = new Map()

    function search(data) {
        if (typeof data === 'object' && data !== null) {
            if (references.has(data)) {
                data = references.get(data)
            } else {
                references.set(data, data)

                for (var key in data) {
                    data[key] = search(data[key])
                }
            }

            return data
        } else if (typeof data === 'string' && match(data, start, end)) {
            return action(data)
        } else {
            return data
        }
    }

    return search(data)
}

module.exports = traverse
