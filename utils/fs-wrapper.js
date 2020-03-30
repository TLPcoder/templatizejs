var fs = require('fs')
var path = require('path')
var Promise = require('bluebird').Promise

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

module.exports = {
    readFile: readFile,
    writeFile: writeFile,
    readFileSync: readFileSync,
    writeFileSync: writeFileSync
}
