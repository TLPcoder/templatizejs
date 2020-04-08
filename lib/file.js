// var json = require('./json')
// var jsyaml = require('js-yaml')
// var fsWrapper = require('../utils/fs-wrapper')
var normalizers = require('../utils/normalize')
var resolve = require('../utils/resolve-template')()

// var writeFile = fsWrapper.writeFile
// var writeFileSync = fsWrapper.writeFileSync

// var normalize = normalizers.normalize
var normalizeWithFiles = normalizers.file.normalizeWithFiles
var normalizeWithFilesSync = normalizers.file.normalizeWithFilesSync


// var writeFile = fsWrapper.writeFile
// var writeFileSync = fsWrapper.writeFileSync

function file() {
    var args = normalizeWithFilesSync.apply(null, arguments)
    return  resolve.apply(null, args)
}

// function fileUnresolved() {
//     var result = json.unresolved.apply(null, arguments)
//     return [ jsyaml.safeDump(result[0]), result[1] ]
// }

// function fileReadFile() {
//     return json.readFile.apply(null, arguments)
//         .then(function (result) {
//             return jsyaml.safeDump(result)
//         })
// }

// function fileReadFileSync() {
//     var result = json.readFileSync.apply(null, arguments)
//     return jsyaml.safeDump(result)
// }

// function fileWriteFile(writeTo) {
//     var args = Array.prototype.slice.call(arguments, 1)
//     return fileReadFile.apply(null, args)
//         .then(function(result) {
//             return writeFile(writeTo, result)
//                 .then(function() {
//                     return result
//                 })
//         })
// }

// function fileWriteFileSync(writeTo) {
//     var args = Array.prototype.slice.call(arguments, 1)
//     var result = fileReadFileSync.apply(null, args)

//     writeFileSync(writeTo, result)

//     return result
// }


// file.unresolved = fileUnresolved
// file.readFile = fileReadFile
// file.readFileSync = fileReadFileSync
// file.writeFile = fileWriteFile
// file.writeFileSync = fileWriteFileSync

module.exports = file
