var fs = require('fs')
var chai = require('chai')
var jsyaml = require('js-yaml')
var templatize = require('../index')
// var isNode

if (process !== undefined) {
    // isNode = true
}

describe('YAML', function () {
    describe('templatize.yaml', function() {
        it('templatize.yaml with YAML', function () {
            var main = 'hello: \'{{world}}\'\nworld: world'
            var updated = 'hello: world\nworld: world\n'
            var result = templatize.yaml(main)
            chai.expect(result).eq(updated)
        })

        it('templatize.yaml with JSON', function () {
            var main = { hello: '{{world}}', world: 'world' }
            var result = templatize.yaml(main)
            var updated = jsyaml.safeDump({ hello: 'world', world: 'world' })
            chai.expect(result).eq(updated)
        })

        it('templatize.yaml with source', function () {
            var main = { hello: '{{world}}' }
            var result = templatize.yaml(main, { world: 'world' })
            var updated = jsyaml.safeDump({ hello: 'world' })
            chai.expect(result).eq(updated)
        })
        it('templatize.yaml with source YAML', function () {
            var main = { hello: '{{world}}' }
            var result = templatize.yaml(main, 'world: world')
            var updated = jsyaml.safeDump({ hello: 'world' })
            chai.expect(result).eq(updated)
        })
    })
    describe('templatize.yaml.unresolved', function() {
        it('unresolved', function () {
            var main = 'hello: \'{{world}}\'\n'
            var result = templatize.yaml.unresolved(main)
            chai.expect(result[0]).eq(main)
            chai.expect(result[1].length).eq(1)
            chai.expect(result[1]).deep.eq(['{{world}}'])
        })
    })
    describe('templatize.yaml.readFile', function() {
        it('read yaml file', function (done) {
            var updated = 'hello: world\nworld: world\n'
            templatize.yaml.readFile(__dirname + '/test-data/test-yaml1.yaml')
                .then(function(result) {
                    chai.expect(result).eq(updated)
                    done()
                })
        })
    })
    describe('templatize.yaml.readFileSync', function() {
        it('read yaml file', function () {
            var updated = 'hello: world\nworld: world\n'
            var result = templatize.yaml.readFileSync(__dirname + '/test-data/test-yaml1.yaml')
            chai.expect(result).eq(updated)
        })
    })
    describe('templatize.yaml.writeFile', function() {
        it('write file with yaml string', function (done) {
            var writeTo = __dirname + '/test-data/tmp.yaml'
            var main = 'hello: \'{{world}}\'\nworld: world'
            var updated = 'hello: world\nworld: world\n'
            templatize.yaml.writeFile(writeTo, main)
                .then(function(result) {
                    var writtenFile = fs.readFileSync(writeTo, 'utf8')

                    chai.expect(result).deep.eq(updated)
                    chai.expect(writtenFile).deep.eq(updated)

                    fs.unlinkSync(writeTo)

                    done()
                })
        })
        it('write file with yaml file', function (done) {
            var writeTo = __dirname + '/test-data/tmp.yaml'
            var main = __dirname + '/test-data/test-yaml1.yaml'
            var updated = 'hello: world\nworld: world\n'
            templatize.yaml.writeFile(writeTo, main)
                .then(function(result) {
                    var writtenFile = fs.readFileSync(writeTo, 'utf8')

                    chai.expect(result).deep.eq(updated)
                    chai.expect(writtenFile).deep.eq(updated)

                    fs.unlinkSync(writeTo)

                    done()
                })
        })
    })
    describe('templatize.yaml.writeFileSync', function() {
        it('write file with yaml string', function () {
            var writeTo = __dirname + '/test-data/tmp.yaml'
            var main = 'hello: \'{{world}}\'\nworld: world'
            var updated = 'hello: world\nworld: world\n'
            var result = templatize.yaml.writeFileSync(writeTo, main)
            var writtenFile = fs.readFileSync(writeTo, 'utf8')

            chai.expect(result).deep.eq(updated)
            chai.expect(writtenFile).deep.eq(updated)

            fs.unlinkSync(writeTo)

        })
        it('write file with yaml file', function () {
            var writeTo = __dirname + '/test-data/tmp.yaml'
            var main = __dirname + '/test-data/test-yaml1.yaml'
            var updated = 'hello: world\nworld: world\n'
            var result = templatize.yaml.writeFileSync(writeTo, main)
            var writtenFile = fs.readFileSync(writeTo, 'utf8')

            chai.expect(result).deep.eq(updated)
            chai.expect(writtenFile).deep.eq(updated)

            fs.unlinkSync(writeTo)
        })
    })
})
