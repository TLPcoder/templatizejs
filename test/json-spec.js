var chai = require('chai')
var templatejs = require('../lib/json')
var isNode

if (process !== undefined) {
    isNode = true
}

describe('templates', function () {
    it('keep same ref', function () {
        var main = {
            hello: '{{world}}',
            world: 'world'
        }
        var updated = {
            hello: 'world',
            world: 'world'
        }
        chai.expect(templatejs(main)).deep.eq(updated)
        chai.expect(templatejs(main)).eq(main)
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
        chai.expect(templatejs(main)).deep.eq(updated)
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
        chai.expect(templatejs(main, secondary)).deep.eq(updated)
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
        chai.expect(templatejs(main, '{')).deep.eq(updated)
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
        chai.expect(templatejs(main, '${', '}')).deep.eq(updated)
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
        chai.expect(templatejs(main, secondaries, '${', '}')).deep.eq(updated)
    })
    it('main only defaults', function () {
        var main = {
            hello: 'hello {{world: world}}'
        }
        var updated = {
            hello: 'hello world'
        }
        chai.expect(templatejs(main)).deep.eq(updated)
    })

    it('main defaults with start and end', function () {
        var main = {
            hello: 'hello ${world: world}$'
        }
        var updated = {
            hello: 'hello world'
        }
        chai.expect(templatejs(main, '${', '}$')).deep.eq(updated)
    })

    it('multiple defaults', function () {
        var main = {
            hello: 'hello {{ world: {{ hi: world }} }}'
        }
        var updated = {
            hello: 'hello world'
        }
        chai.expect(templatejs(main)).deep.eq(updated)
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
        chai.expect(templatejs(main)).deep.eq(updated)
    })

    it('template reference object in a string should replace string', function() {
        var main = {
            hello: 'sad {{ world }}',
            world: { covid19: 'sad world'}
        }
        var updated = {
            hello: { covid19: 'sad world'},
            world: { covid19: 'sad world'}
        }
        chai.expect(templatejs(main)).deep.eq(updated)
    })

    if (isNode) {
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
            chai.expect(templatejs(main)).deep.eq(updated)

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
            chai.expect(templatejs(main)).deep.eq(updated)

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

            chai.expect(templatejs(main)).deep.eq(updated)

            delete process.env.NODE_ENV
        })
    }
})

function setVCAPEnv() {
    delete require.cache[require.resolve('../lib/json')]

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

    templatejs = require('../lib/json')

    return function() {
        delete process.env.VCAP_APPLICATION
        delete process.env.VCAP_SERVICES
        delete require.cache[require.resolve('../lib/json')]

        templatejs = require('../lib/json')
    }
}
