var json = require('./json')
var jsyaml = require('js-yaml')
var fsWrapper = require('../utils/fs-wrapper')

var writeFile = fsWrapper.writeFile
var writeFileSync = fsWrapper.writeFileSync

function yaml() {
    var result = json.apply(null, arguments)
    return jsyaml.safeDump(result)
}

function yamlUnresolved() {
    var result = json.unresolved.apply(null, arguments)
    return [ jsyaml.safeDump(result[0]), result[1] ]
}

function yamlReadFile() {
    return json.readFile.apply(null, arguments)
        .then(function (result) {
            return jsyaml.safeDump(result)
        })
}

function yamlReadFileSync() {
    var result = json.readFileSync.apply(null, arguments)
    return jsyaml.safeDump(result)
}

function yamlWriteFile(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    return yamlReadFile.apply(null, args)
        .then(function(result) {
            return writeFile(writeTo, result)
                .then(function() {
                    return result
                })
        })
}

function yamlWriteFileSync(writeTo) {
    var args = Array.prototype.slice.call(arguments, 1)
    var result = yamlReadFileSync.apply(null, args)

    writeFileSync(writeTo, result)

    return result
}


yaml.unresolved = yamlUnresolved
yaml.readFile = yamlReadFile
yaml.readFileSync = yamlReadFileSync
yaml.writeFile = yamlWriteFile
yaml.writeFileSync = yamlWriteFileSync

module.exports = yaml
