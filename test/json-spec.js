var fs = require('fs')
var http = require('http')
var chai = require('chai')
var templatize = require('../index')

describe('templatize JSON', function () {
    describe('json', function() {
        it('keep same ref', function () {
            var main = {
                hello: '{{world}}',
                world: 'world'
            }
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
            chai.expect(templatize.json(main)).eq(main)
        })

        it('multi templates', function () {
            var main = {
                helloworld: '{{h}}{{world}}',
                h: 'hello',
                world: 'world'
            }
            var updated = {
                helloworld: 'helloworld',
                h: 'hello',
                world: 'world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
            chai.expect(templatize.json(main)).eq(main)
        })

        it('multi depth', function () {
            var main = {
                helloworld: '{{h}}{{world}}',
                hi: {
                    there: {
                        how: {
                            are: {
                                you: '{{feeling}}'
                            }
                        }
                    }
                },
                feeling: 'good',
                h: 'hello',
                world: 'world'
            }
            var updated = {
                helloworld: 'helloworld',
                hi: {
                    there: {
                        how: {
                            are: {
                                you: 'good'
                            }
                        }
                    }
                },
                feeling: 'good',
                h: 'hello',
                world: 'world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
            chai.expect(templatize.json(main)).eq(main)
        })


        it('circular reference', function (done) {
            var server = http.createServer(function (req, res) {
                try {
                    var main = {
                        url: '{{req.url}}',
                        host: '{{req.headers.host}}',
                        headers: '{{req.headers}}'
                    }
                    var updated = {
                        url: '/template',
                        host: 'localhost:3000',
                        headers: {
                            connection: 'close',
                            host: 'localhost:3000'
                        }
                    }
                    var resolved = templatize.json(main, { req, res })
                    req.fullURL = 'http://{{headers.host}}{{url}}'
                    var reqResolved = templatize.json(req)
                    chai.expect(reqResolved.fullURL).eq('http://localhost:3000/template')
                    chai.expect(resolved).deep.eq(updated)
                    req.url = 'http://{{headers.host}}{{url}}'
                    var reqResolved = templatize.json(req)
                    // cant reference self
                    chai.expect(reqResolved.url).eq('http://localhost:3000{{url}}')
                    res.end('')
                } catch(err) {
                    server.close()
                    done(err)
                }
            }).listen(3000)

            http.request(require('url').parse('http://localhost:3000/template'), function(res) {
                res.on('data', function() {})
                res.on('end', function() {
                    server.close()
                    done()
                })
            }).on('error', function(err) {
                console.log(err)
            }).end()
                
        })

        it('resolve tempaltes with templates', function () {
            var main = {
                helloworld: '{{locationHello}} {{locationWorld}}',
                locationHello: '{{hello}}',
                locationWorld: '{{world}}',
                hello: 'hello',
                world: 'world'
            }
            var updated = {
                helloworld: 'hello world',
                locationHello: 'hello',
                locationWorld: 'world',
                hello: 'hello',
                world: 'world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
            chai.expect(templatize.json(main)).eq(main)
        })

        it('main templates only', function () {
            var main = {
                hello: '{{world}}',
                world: 'world'
            }
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('secondary', function () {
            var main = {
                hello: '{{world}}'
            }
            var secondary = {
                world: 'world'
            }
            var updated = {
                hello: 'world'
            }
            chai.expect(templatize.json(main, secondary)).deep.eq(updated)
        })

        it('main only different start', function () {
            var main = {
                hello: '{world}}',
                world: 'world'
            }
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(templatize.json(main, '{')).deep.eq(updated)
        })
        it('main only different start and end', function () {
            var main = {
                hello: 'hello ${world}',
                world: 'world'
            }
            var updated = {
                hello: 'hello world',
                world: 'world'
            }
            chai.expect(templatize.json(main, '${', '}')).deep.eq(updated)
        })
        it('main, secondaries, start, and end', function () {
            var main = {
                hello: 'hello ${world}'
            }
            var secondaries = [{
                a: 'b'
            }, {
                world: 'world'
            }]
            var updated = {
                hello: 'hello world'
            }
            chai.expect(templatize.json(main, secondaries, '${', '}')).deep.eq(updated)
        })
        it('main only defaults', function () {
            var main = {
                hello: 'hello {{world: world}}'
            }
            var updated = {
                hello: 'hello world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('main defaults with start and end', function () {
            var main = {
                hello: 'hello ${world: world}$'
            }
            var updated = {
                hello: 'hello world'
            }
            chai.expect(templatize.json(main, '${', '}$')).deep.eq(updated)
        })

        it('multiple defaults', function () {
            var main = {
                hello: 'hello {{ world: {{ hi: world }} }}'
            }
            var updated = {
                hello: 'hello world'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('multiple defaults 2', function () {
            var main = {
                'value': '{{hi: {{ default2: {{ default3: defaultValue }} }} }}',
                'default2': 'defaultValue'
            }
            var updated = {
                'value': 'defaultValue',
                'default2': 'defaultValue'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('multiple defaults 3', function () {
            var main = {
                'value': '{{hi: {{ default2: {{ default3: defaultValue }} }} }}',
            }
            var updated = {
                'value': 'defaultValue',
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('multiple defaults 4', function () {
            var main = {
                'value': '{hi: { default2: { default3: defaultValue } } }',
                'value1': '{value}',
            }
            var updated = {
                'value': 'defaultValue',
                'value1': 'defaultValue',
            }
            chai.expect(templatize.json(main, '{', '}')).deep.eq(updated)
        })

        it('template reference', function() {
            var main = {
                hello: 'sad {{ world }}',
                world: { covid19: 'sad world'}
            }
            var updated = {
                hello: { covid19: 'sad world'},
                world: { covid19: 'sad world'}
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('template reference object in a string should replace string', function() {
            var main = {
                hello: 'sad {{ world }}',
                world: { covid19: 'sad world'},
                empty: null
            }
            var updated = {
                hello: { covid19: 'sad world'},
                world: { covid19: 'sad world'},
                empty: null
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
        })

        it('custom callback to handle templates', function() {
            var main = {
                hello: 'sad {{ world }}',
                world: { covid19: 'sad world'},
                empty: null
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
                world: { covid19: 'sad world'},
                empty: null
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, handle)).deep.eq(updated)
        })

        it('custom callback to handle templates with sources', function() {
            var main = {
                hello: 'sad {{ world }}',
            }
            var source = {
                world: { covid19: 'sad world'},
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, source, handle)).deep.eq(updated)
        })
        
        it('custom callback to handle templates with custom template start only', function() {
            var main = {
                hello: 'sad ${ world }}',
                world: { covid19: 'sad world'},
                empty: null
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
                world: { covid19: 'sad world'},
                empty: null
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, '${', handle)).deep.eq(updated)
        })

        it('custom callback to handle templates with custom templates', function() {
            var main = {
                hello: 'sad ${ world }',
                world: { covid19: 'sad world'},
                empty: null
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
                world: { covid19: 'sad world'},
                empty: null
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, '${', '}', handle)).deep.eq(updated)
        })

        it('custom callback unresolved', function() {
            var main = {
                hello: 'sad ${ world }',
                testing: '${nothing}',
                world: { covid19: 'sad world'},
                empty: null
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
                testing: '${nothing}',
                world: { covid19: 'sad world'},
                empty: null
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            var result = templatize.json.unresolved(main, '${', '}', handle)

            var resolved = result[0]
            var unresolved = result[1]

            chai.expect(resolved).deep.eq(updated)
            chai.expect(unresolved[0]).deep.eq('${nothing}')
        })

        it('custom callback to handle templates all options', function() {
            var main = {
                hello: 'sad ${ world }',
            }
            var source = {
                world: { covid19: 'sad world'},
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, source, '${', '}', handle)).deep.eq(updated)
        })

        it('custom callback to handle templates all options', function() {
            var main = {
                hello: 'sad ${ world }}',
            }
            var source = {
                world: { covid19: 'sad world'},
            }
            var updated = {
                hello: 'sad {"covid19":"sad world"}',
            }
            function handle(value, match, str, main, secondaries) {
                if (typeof value === 'object' && match !== str) {
                    return JSON.stringify(value)
                }

                return value
            }
            chai.expect(templatize.json(main, source, '${', handle)).deep.eq(updated)
        })

        it('vcap application', function () {
            var removeVCAP = setVCAPEnv()
            var main = {
                appName: '{{vcap.application.name}}',
                uri: '{{vcap.application.uris[0]}}'
            }
            var updated = {
                appName: 'my-app',
                uri: 'my-app.example.com'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)

            removeVCAP()
        })

        it('vcap services', function () {
            var removeVCAP = setVCAPEnv()
            var main = {
                serviceName: '{{vcap.services.my-service.name}}',
                cert: '{{vcap.services.my-service.credentials.cert}}'
            }
            var updated = {
                serviceName: 'my-service',
                cert: 'my-cert'
            }
            chai.expect(templatize.json(main)).deep.eq(updated)
            
            removeVCAP()
        })

        it('process', function () {
            process.env.NODE_ENV = 'development'

            var nodeVersion = process.version
            var main = {
                nodeVersion: '{{process.version}}',
                env: '{{process.env.NODE_ENV}}'
            }
            var updated = {
                nodeVersion: nodeVersion,
                env: process.env.NODE_ENV
            }

            chai.expect(templatize.json(main)).deep.eq(updated)

            delete process.env.NODE_ENV
        })
    })
    describe('unresolved', function() {
        it('template missing', function() {
            var main = {
                hello: '{{world}}',
                world: 'world',
                hi: '{{unresolved}}'
            }
            var updated = {
                hello: 'world',
                world: 'world',
                hi: '{{unresolved}}'
            }
            var result = templatize.json.unresolved(main)
            var resolved = result[0]
            var templates = result[1]

            chai.expect(resolved).deep.eq(updated)
            chai.expect(templates.length).eq(1)
            chai.expect(templates[0]).eq('{{unresolved}}')
        })
    })
    describe('json files', function() {
        it('file async main only', function(done) {
            templatize.json.readFile(__dirname + '/test-data/test-json1.json')
                .then(function(json) {
                    var updated = {
                        hello: 'world',
                        world: 'world'
                    }
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('file async main + secondary', function(done) {
            var main = __dirname + '/test-data/test-json2.json'
            var secondary = __dirname + '/test-data/test-json3.json'

            templatize.json.readFile(main, secondary)
                .then(function(json) {
                    var updated = {
                        hello: 'world'
                    }
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('file async main "json string" + secondary', function(done) {
            var secondary = __dirname + '/test-data/test-json3.json'

            templatize.json.readFile('{"hello": "{{world}}"}', secondary)
                .then(function(json) {
                    var updated = {
                        hello: 'world'
                    }
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('file async main + ${} template', function(done) {
            var main = __dirname + '/test-data/test-json4.json'

            templatize.json.readFile(main, '${', '}')
                .then(function(json) {
                    var updated = {
                        hello: 'world',
                        world: 'world'
                    }
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('file async main + secondary + ${} template', function(done) {
            var main = __dirname + '/test-data/test-json5.json'
            var secondary = __dirname + '/test-data/test-json3.json'

            templatize.json.readFile(main, secondary, '${', '}')
                .then(function(json) {
                    var updated = {
                        hello: 'world'
                    }
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('using file but not file paths', function(done) {
            var main = {
                hello: '{{world}}',
                world: 'world'
            }
            var updated = {
                hello: 'world',
                world: 'world'
            }

            templatize.json.readFile(main)
                .then(function(json) {
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('using file but not file paths + secondary', function(done) {
            var main = {
                hello: '{{world}}'
            }
            var secondary = {
                world: 'world'
            }
            var updated = {
                hello: 'world'
            }

            templatize.json.readFile(main, secondary)
                .then(function(json) {
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('using file but not file paths + secondary + different Template', function(done) {
            var main = {
                hello: '${world}'
            }
            var secondary = {
                world: 'world'
            }
            var updated = {
                hello: 'world'
            }

            templatize.json.readFile(main, secondary, '${', '}')
                .then(function(json) {
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('using file but not file paths + secondary with both files and objects', function(done) {
            var main = {
                hello: '${world}'
            }
            var secondaries = [
                {world: 'world'},
                __dirname + '/test-data/test-json3.json'
            ]
            var updated = {
                hello: 'world'
            }

            templatize.json.readFile(main, secondaries, '${', '}')
                .then(function(json) {
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
        it('bad file path', function(done) {

            templatize.json.readFile('/bad/path')
                .catch(function(err) {
                    chai.expect(err.message).deep.eq('cant resolve /bad/path')
                    done()
                })
        })

        it('file async callback', function(done) {
            var called = false
            var callback = function (value) {
                called = true
                return value
            }
            templatize.json.readFile(__dirname + '/test-data/test-json1.json', callback)
                .then(function(json) {
                    var updated = {
                        hello: 'world',
                        world: 'world'
                    }
                    chai.expect(called).eq(true)
                    chai.expect(json).deep.eq(updated)
                    done()
                })
        })
    })
    describe('json files sync', function() {
        it('file sync main only', function() {
            var json = templatize.json.readFileSync(__dirname + '/test-data/test-json1.json')
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(json).deep.eq(updated)
        })

        it('custom callback to handle templates with sources', function() {
            var wasCalled = false
            var file = __dirname + '/test-data/test-json1.json'
            var json = templatize.json.readFileSync(file, handle)
            var updated = {
                hello: 'world',
                world: 'world'
            }
            function handle(value) {
                wasCalled = true

                return value
            }
            chai.expect(json).deep.eq(updated)
            chai.expect(wasCalled).eq(true)
        })
        
        it('file sync main + secondary', function() {
            var main = __dirname + '/test-data/test-json2.json'
            var secondary = __dirname + '/test-data/test-json3.json'

            var json = templatize.json.readFileSync(main, secondary)
            var updated = {
                hello: 'world'
            }
            chai.expect(json).deep.eq(updated)
        })
        it('file sync main + ${} template', function() {
            var main = __dirname + '/test-data/test-json4.json'

            var json = templatize.json.readFileSync(main, '${', '}')
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(json).deep.eq(updated)
        })
        it('file sync main + secondary + ${} template', function() {
            var main = __dirname + '/test-data/test-json5.json'
            var secondary = __dirname + '/test-data/test-json3.json'

            var json = templatize.json.readFileSync(main, secondary, '${', '}')
            var updated = {
                hello: 'world'
            }
            chai.expect(json).deep.eq(updated)
        })
        it('using file but not file paths', function() {
            var main = {
                hello: '{{world}}',
                world: 'world'
            }
            var updated = {
                hello: 'world',
                world: 'world'
            }

            var json = templatize.json.readFileSync(main)
            chai.expect(json).deep.eq(updated)
        })
        it('using file but not file paths + secondary', function() {
            var main = {
                hello: '{{world}}'
            }
            var secondary = {
                world: 'world'
            }
            var updated = {
                hello: 'world'
            }

            var json = templatize.json.readFileSync(main, secondary)
            chai.expect(json).deep.eq(updated)
        })
        it('using file but not file paths + secondary + different Template', function() {
            var main = {
                hello: '${world}'
            }
            var secondary = {
                world: 'world'
            }
            var updated = {
                hello: 'world'
            }

            var json = templatize.json.readFileSync(main, secondary, '${', '}')
            chai.expect(json).deep.eq(updated)
        })
        it('using file but not file paths + secondary with both files and objects', function() {
            var main = {
                hello: '${world}'
            }
            var secondaries = [
                {world: 'world'},
                __dirname + '/test-data/test-json3.json'
            ]
            var updated = {
                hello: 'world'
            }

            var json = templatize.json.readFileSync(main, secondaries, '${', '}')
            chai.expect(json).deep.eq(updated)
        })
        it('bad file path', function() {

            try {
                templatize.json.readFileSync('/bad/path')
            } catch(err) {
                chai.expect(err.message).deep.eq('cant resolve /bad/path')
            }
        })
        it('file sync callback', function() {
            var called = false
            var callback = function(value) {
                called = true
                return value
            }
            var json = templatize.json.readFileSync(__dirname + '/test-data/test-json1.json', callback)
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(called).eq(true)
            chai.expect(json).deep.eq(updated)
        })
    })
    describe('write json file async', function() {
        it('write file', function(done) {
            var writeTo = __dirname + '/test-data/tmp.json'
            var main = __dirname + '/test-data/test-json1.json'

            templatize.json.writeFile(writeTo, main)
                .then(function(json) {
                    var writtenFile = fs.readFileSync(writeTo, 'utf8')
                    var updated = {
                        hello: 'world',
                        world: 'world'
                    }

                    chai.expect(json).deep.eq(updated)
                    chai.expect(json).deep.eq(JSON.parse(writtenFile))

                    fs.unlinkSync(writeTo)

                    done()
                })
        })
        it('write file with cb', function(done) {
            var wasCalled = false
            var writeTo = __dirname + '/test-data/tmp.json'
            var main = __dirname + '/test-data/test-json1.json'
            
            function cb(value) {
                wasCalled = true
                return value
            }

            templatize.json.writeFile(writeTo, main, cb)
                .then(function(json) {
                    var writtenFile = fs.readFileSync(writeTo, 'utf8')
                    var updated = {
                        hello: 'world',
                        world: 'world'
                    }

                    chai.expect(wasCalled).deep.eq(true)
                    chai.expect(json).deep.eq(updated)
                    chai.expect(json).deep.eq(JSON.parse(writtenFile))

                    fs.unlinkSync(writeTo)

                    done()
                })
        })
    })
    describe('write json file sync', function() {
        it('write file', function() {
            var writeTo = __dirname + '/test-data/tmp.json'
            var main = __dirname + '/test-data/test-json1.json'

            var json = templatize.json.writeFileSync(writeTo, main)
            var writtenFile = fs.readFileSync(writeTo, 'utf8')
            var updated = {
                hello: 'world',
                world: 'world'
            }

            chai.expect(json).deep.eq(updated)
            chai.expect(json).deep.eq(JSON.parse(writtenFile))

            fs.unlinkSync(writeTo)
        })
        it('writesync file with cb', function() {
            var wasCalled = false
            var writeTo = __dirname + '/test-data/tmp.json'
            var main = __dirname + '/test-data/test-json1.json'
            var cb = function(value) {
                wasCalled = true
                return value
            }
            var json = templatize.json.writeFileSync(writeTo, main, cb)
            var writtenFile = fs.readFileSync(writeTo, 'utf8')
            var updated = {
                hello: 'world',
                world: 'world'
            }
            chai.expect(wasCalled).eq(true)
            chai.expect(json).deep.eq(updated)
            chai.expect(json).deep.eq(JSON.parse(writtenFile))

            fs.unlinkSync(writeTo)
        })
    })
})

function setVCAPEnv() {
    delete require.cache[require.resolve('../utils/resolve-template.js')]
    delete require.cache[require.resolve('../lib/json')]
    delete require.cache[require.resolve('../index')]

    process.env.VCAP_APPLICATION = JSON.stringify({
        'application_id': 'fa05c1a9-0fc1-4fbd-bae1-139850dec7a3',
        'application_name': 'my-app',
        'application_uris': [
            'my-app.example.com'
        ],
        'application_version': 'fb8fbcc6-8d58-479e-bcc7-3b4ce5a7f0ca',
        'cf_api': 'https://api.example.com',
        'limits': {
            'disk': 1024,
            'fds': 16384,
            'mem': 256
        },
        'name': 'my-app',
        'organization_id': 'c0134bad-97a9-468d-ab9d-e97547e3aed5',
        'organization_name': 'my-org',
        'space_id': '06450c72-4669-4dc6-8096-45f9777db68a',
        'space_name': 'my-space',
        'uris': [
            'my-app.example.com'
        ],
        'users': null,
        'version': 'fb8fbcc6-8d58-479e-bcc7-3b4ce5a7f0ca'
    })
    process.env.VCAP_SERVICES = JSON.stringify({
        'elephantsql': [{
            'name': 'elephantsql-binding-c6c60',
            'binding_name': 'elephantsql-binding-c6c60',
            'instance_name': 'elephantsql-c6c60',
            'label': 'elephantsql',
            'tags': [
                'postgres',
                'postgresql',
                'relational'
            ],
            'plan': 'turtle',
            'credentials': {
                'uri': 'postgres://exampleuser:examplepass@babar.elephantsql.com:5432/exampleuser'
            }
        }],
        'user-provided': [{
            'name': 'my-service',
            'instance_name': 'my-service',
            'binding_name': null,
            'credentials': {
                'cert': 'my-cert',
            },
            'syslog_drain_url': '',
            'volume_mounts': [],
            'label': 'user-provided',
            'tags': []
        }]
    })

    templatize = require('../index')

    return function() {
        delete process.env.VCAP_APPLICATION
        delete process.env.VCAP_SERVICES
        delete require.cache[require.resolve('../utils/resolve-template.js')]
        delete require.cache[require.resolve('../lib/json')]
        delete require.cache[require.resolve('../index')]

        templatize = require('../index')
    }
}
