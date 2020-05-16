var fsWrapper = require('../utils/fs-wrapper')
var normalizers = require('../utils/normalize')
var resolve = require('../utils/resolve-template')()

var normalizeWithFiles = normalizers.file.normalizeWithFiles
var normalizeWithFilesSync = normalizers.file.normalizeWithFilesSync


var writeFile = fsWrapper.writeFile
var writeFileSync = fsWrapper.writeFileSync

function file() {
    var args = normalizeWithFilesSync.apply(null, arguments)
    return resolve.apply(null, args)
}

function fileUnresolved() {
    var args = normalizeWithFilesSync.apply(null, arguments)
    var result = file.apply(null, args)

    var start = args[2]
    var end = args[3]

    var templates = []
    var startQueue = []
    var closingQueue = []

    for(var i = 0; i < result.length; i++) {
        if (result.slice(i, i + start.length) === start) {
            startQueue.push(i)

            i += start.length - 1
        }

        if (result.slice(i, i + end.length) === end) {
            closingQueue.push(i)

            if (startQueue.length === closingQueue.length) {
                var opening = startQueue.shift()
                var template = result.slice(opening, i + end.length)

                templates.push(template)

                startQueue = []
                closingQueue = []
            }

            i += end.length - 1
        }
    }

    return [ result, templates ]
}

function fileReadFile() {
    return normalizeWithFiles.apply(null, arguments)
        .then(function(args) {
            return resolve.apply(null, args)
        })
}

function fileReadFileSync() {
    return file.apply(null, arguments)
}

function fileWriteFile(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    return fileReadFile.apply(null, args)
        .then(function(result) {
            return writeFile(writeTo, result)
                .then(function() {
                    return result
                })
        })
}

function fileWriteFileSync(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    var result = fileReadFileSync.apply(null, args)

    writeFileSync(writeTo, result)

    return result
}


file.unresolved = fileUnresolved
file.readFile = fileReadFile
file.readFileSync = fileReadFileSync
file.writeFile = fileWriteFile
file.writeFileSync = fileWriteFileSync

module.exports = file
