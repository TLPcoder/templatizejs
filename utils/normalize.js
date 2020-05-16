var jsyaml = require('js-yaml')
var ea = require('ensure-array')
var traverse = require('./traverse')
var fsWrapper = require('./fs-wrapper')
var Promise = require('bluebird').Promise
var resolve = require('./resolve-template')(traverse)

var fileExist = fsWrapper.fileExist
var readFile = fsWrapper.readFile
var readFileSync = fsWrapper.readFileSync

function isFunction(f) {
    return typeof f === 'function'
}

function parseFormat(config) {
    if (
        typeof config === 'object' &&
        config !== null
    ) {
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

function normalize(main, secondaries, start, end, cb) {
    if (secondaries && !isFunction(secondaries)) {
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
    } else if (isFunction(secondaries)) {
        cb = secondaries
        secondaries = null
    }

    if (!start) {
        start = '{{'
    } else if (isFunction(start)) {
        cb = start
        start = '{{'
    }

    if (!end) {
        end = '}}'
    } else if (isFunction(end)) {
        cb = end
        end = '}}'
    }

    if (!secondaries) {
        secondaries = null
    }

    if (!cb) {
        cb = null
    }

    if(typeof secondaries === 'object' && secondaries !== null) {
        secondaries = ea(secondaries).map(function(e) {
            return resolve(parseFormat(e), null, start, end)
        })
    }

    return [ main, secondaries, start, end, cb ]
}

function normalizeWithFiles(main, secondaries, start, end, notFile, cb) {
    if (fileExist(main)) {
        return readFile(main).then(function(file) {
            main = file
            return resolveSecondary()
        }).then(function () {
            return normalize(main, secondaries, start, end, cb)
        })
    }  else if (notFile && typeof main === 'string') {
        return Promise.reject(Error('cant resolve ' + main))
    } else {
        return resolveSecondary().then(function () {
            return normalize(main, secondaries, start, end, cb)
        })
    }

    function resolveSecondary() {
        if (
            secondaries instanceof Array ||
            typeof secondaries === 'string'
        ) {
            var paths = ea(secondaries).map(function(f) {
                return typeof f === 'string'
                    ? readFile(f)
                    : Promise.resolve(f)
            })

            return Promise.all(paths).then(function(files) {
                secondaries = files
            // eslint-disable-next-line no-unused-vars
            }).catch(function(_err) {
                Promise.resolve()
            })
        } else {
            return Promise.resolve()
        }
    }
}

function normalizeWithFilesSync(main, secondaries, start, end, notFile, cb) {
    if (fileExist(main)) {
        main = readFileSync(main)
    } else if (notFile && typeof main === 'string') {
        throw Error('cant resolve ' + main)
    }

    resolveSecondary()

    return normalize(main, secondaries, start, end, cb)

    function resolveSecondary() {
        if (
            secondaries instanceof Array ||
            typeof secondaries === 'string'
        ) {
            try {
                secondaries = ea(secondaries).map(function(f) {
                    return typeof f === 'string' ? readFileSync(f) : f
                })
            // eslint-disable-next-line no-empty
            } catch(_err) {}
        }
    }
}

function jsonNormalize(main, secondaries, start, end, cb) {
    main = parseFormat(main)
    return normalize(main, secondaries, start, end, cb)
}

function jsonNormalizeWithFiles(main, secondaries, start, end, cb) {
    try {
        main = parseFormat(main)
    // eslint-disable-next-line no-empty
    } catch(_err) {}

    return normalizeWithFiles(main, secondaries, start, end, true, cb)
        .then(function(args) {
            args[0] = parseFormat(args[0])
            return args
        })
}

function jsonNormalizeWithFilesSync(main, secondaries, start, end, cb) {
    try {
        main = parseFormat(main)
    // eslint-disable-next-line no-empty
    } catch(_err) {}

    if (typeof main === 'string') {
        var args = normalizeWithFilesSync(main, secondaries, start, end, true, cb)
        args[0] = parseFormat(args[0])
        return args
    } else {
        return normalize(main, secondaries, start, end, cb)
    }
}

module.exports = {
    json: {
        normalize: jsonNormalize,
        normalizeWithFiles: jsonNormalizeWithFiles,
        normalizeWithFilesSync: jsonNormalizeWithFilesSync
    },
    yaml: {
        normalize: jsonNormalize,
        normalizeWithFiles: jsonNormalizeWithFiles,
        normalizeWithFilesSync: jsonNormalizeWithFilesSync
    },
    file: {
        normalizeWithFiles: normalizeWithFiles,
        normalizeWithFilesSync: normalizeWithFilesSync
    }
}
