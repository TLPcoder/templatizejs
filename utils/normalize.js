var jsyaml = require('js-yaml')
var ea = require('ensure-array')
var traverse = require('./traverse')
var fsWrapper = require('./fs-wrapper')
var Promise = require('bluebird').Promise
var resolve = require('./resolve-template')(traverse)

var readFile = fsWrapper.readFile
var readFileSync = fsWrapper.readFileSync

function parseFormat(config) {
    if (typeof config === 'object' && config !== null) {
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

function normalize(main, secondaries, start, end) {
    if (secondaries) {
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
    }

    if (!start) {
        start = '{{'
    }

    if (!end) {
        end = '}}'
    }

    if (!secondaries) {
        secondaries = null
    }

    if(typeof secondaries === 'object' && secondaries !== null) {
        secondaries = ea(secondaries).map(function(e) {
            return resolve(parseFormat(e), null, start, end)
        })
    }

    return [ main, secondaries, start, end ]
}

function normalizeWithFiles(main, secondaries, start, end) {
    return resolveSecondary().then(function () {
        return normalize(main, secondaries, start, end)
    })

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

function normalizeWithFilesSync(main, secondaries, start, end) {
    resolveSecondary()

    return normalize(main, secondaries, start, end)

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

function jsonNormalize(main, secondaries, start, end) {
    main = parseFormat(main)
    return normalize(main, secondaries, start, end)
}

function jsonNormalizeWithFiles(main, secondaries, start, end) {
    try {
        main = parseFormat(main)
    // eslint-disable-next-line no-empty
    } catch(_err) {}

    if (typeof main === 'string') {
        return readFile(main).then(function(file) {
            main = file
        }).then(normalizeWithFiles).then(function() {
            return normalize(main, secondaries, start, end)
        })
    }
}

function jsonNormalizeWithFilesSync(main, secondaries, start, end) {
    try {
        main = parseFormat(main)
    // eslint-disable-next-line no-empty
    } catch(_err) {}

    if (typeof main === 'string') {
        main = readFileSync(main)
    }

    return normalizeWithFilesSync(main, secondaries, start, end)
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

    },
    normalize: normalize,
    normalizeWithFiles: normalizeWithFiles,
    normalizeWithFilesSync: normalizeWithFilesSync
}
