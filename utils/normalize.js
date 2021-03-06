var jsyaml = require('js-yaml')
var ea = require('ensure-array')
var fsWrapper = require('./fs-wrapper')
var Promise = require('bluebird').Promise

var fileExist = fsWrapper.fileExist
var readFile = fsWrapper.readFile
var readFileSync = fsWrapper.readFileSync

function isFunction(f) {
    return typeof f === 'function'
}

function isString(s) {
    return typeof s === 'string'
}

function isArray(a) {
    return a instanceof Array
}

function isObject(o) {
    return (typeof o === 'object' && o !== null)
}

function parseFormat(source) {
    if (isObject(source)) {
        return source
    }

    try {
        return JSON.parse(source)
    } catch (err) {
        try {
            return jsyaml.safeLoad(source)
        } catch (_) {
            throw err
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

    if (isString(secondaries)) {
        if (isString(start)) {
            if (isFunction(end)) {
                cb = end
            }

            end = start
            start = secondaries
            secondaries = null
        } else if (isFunction(start)) {
            cb = start
            start = secondaries
            secondaries = null
        } else  {
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

    if(isObject(secondaries)) {
        secondaries = ea(secondaries).map(parseFormat)
    }

    return [ main, secondaries, start, end, cb ]
}

function normalizeWithFiles(main, secondaries, start, end, cb, notFile) {
    if (fileExist(main)) {
        return readFile(main).then(function(file) {
            main = file
            return resolveSecondary()
        }).then(function () {
            return normalize(main, secondaries, start, end, cb)
        })
    }  else if (notFile && isString(main)) {
        return Promise.reject(Error('cant resolve ' + main))
    } else {
        return resolveSecondary().then(function () {
            return normalize(main, secondaries, start, end, cb)
        })
    }

    function resolveSecondary() {
        if (
            isArray(secondaries) ||
            isString(secondaries)
        ) {
            var paths = ea(secondaries).map(function(f) {
                return isString(f)
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

function normalizeWithFilesSync(main, secondaries, start, end, cb, notFile) {
    if (fileExist(main)) {
        main = readFileSync(main)
    } else if (notFile && isString(main)) {
        throw Error('cant resolve ' + main)
    }

    resolveSecondary()

    return normalize(main, secondaries, start, end, cb)

    function resolveSecondary() {
        if (
            isArray(secondaries) ||
            isString(secondaries)
        ) {
            try {
                secondaries = ea(secondaries).map(function(f) {
                    return isString(f) ? readFileSync(f) : f
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

    return normalizeWithFiles(main, secondaries, start, end, cb, true)
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

    if (isString(main)) {
        var args = normalizeWithFilesSync(main, secondaries, start, end, cb, true)
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
        normalizeWithFiles: fileNormalizer(normalizeWithFiles),
        normalizeWithFilesSync: fileNormalizer(normalizeWithFilesSync)
    }
}

function fileNormalizer(normalizer) {
    return function() {
        var args = normalize.apply(null, arguments).concat(false)

        return normalizer.apply(null, args)
    }
}
