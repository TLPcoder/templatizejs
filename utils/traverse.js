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
    if (typeof data === 'object' && data !== null) {
        for (var key in data) {
            data[key] = traverse(data[key], action, start, end)
        }
        return data
    } else if (typeof data === 'string' && match(data, start, end)) {
        return action(data)
    } else {
        return data
    }
}

module.exports = traverse
