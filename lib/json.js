var traverse = require('../utils/traverse')
var fsWrapper = require('../utils/fs-wrapper')
var normalizers = require('../utils/normalize').json
var resolve = require('../utils/resolve-template')(traverse)

var writeFile = fsWrapper.writeFile
var writeFileSync = fsWrapper.writeFileSync

var normalize = normalizers.normalize
var normalizeWithFiles = normalizers.normalizeWithFiles
var normalizeWithFilesSync = normalizers.normalizeWithFilesSync

function json() {
    var args = normalize.apply(null, arguments)

    return resolve.apply(null, args)
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

    traverse(main, action, start, end)

    return templates
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
