var fs = require('fs')
var chai = require('chai')
var templatize = require('../index')

describe('templatize File', function () {
    it('read from file', function () {
        var file = __dirname + '/test-data/test-file1.txt'
        var source = {
            name: 'bob',
            addresses: ['somewhere']
        }
        var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
        var result = templatize.file(file, source)
        chai.expect(result).eq(compare)
    })
    it('pass string', function () {
        var file = __dirname + '/test-data/test-file1.txt'
        var source = {
            name: 'bob',
            addresses: ['somewhere']
        }
        var string = fs.readFileSync(file, 'utf8')
        var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
        var result = templatize.file(string, source)
        chai.expect(result).eq(compare)
    })
    it('nest templates', function () {
        var file = __dirname + '/test-data/test-file3.txt'
        var source = {
            name: {
                first: 'Joe',
                last: 'Exotic'
            },
            framed: {
                JoeExotic: 'Carol Baskin'
            }
        }
        var compare = fs.readFileSync(__dirname + '/test-data/test-file4.txt', 'utf8')
        var result = templatize.file(file, source)
        chai.expect(result).eq(compare)
    })
    describe('file.unresolved', function() {
        it('read from file unresolved', function () {
            var file = __dirname + '/test-data/test-file5.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var compare = fs.readFileSync(__dirname + '/test-data/test-file6.txt', 'utf8')
            var results = templatize.file.unresolved(file, source)
            var result = results[0]
            var unresolved = results[1]
            chai.expect(result).eq(compare)
            chai.expect(unresolved[0]).eq('{{cant resolve}}')
            chai.expect(unresolved[1]).eq('{{nested{{template}}}}')
        })

        it('read from file unresolved different start and end', function () {
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var file = fs.readFileSync(__dirname + '/test-data/test-file5.txt', 'utf8')
                .replace(/{{/g, '${')
                .replace(/}}/g, '}')
            var compare = fs.readFileSync(__dirname + '/test-data/test-file6.txt', 'utf8')
                .replace(/{{/g, '${')
                .replace(/}}/g, '}')
            var results = templatize.file.unresolved(file, source, '${', '}')
            var result = results[0]
            var unresolved = results[1]
            chai.expect(result).eq(compare)
            chai.expect(unresolved[0]).eq('${cant resolve}')
            chai.expect(unresolved[1]).eq('${nested${template}}')
        })
    })
    describe('readFile', function() {
        it('read from file', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.readFile(file, source)
                .then(function(result) {
                    chai.expect(result).eq(compare)
                    done()
                })
        })
        it('pass string', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var string = fs.readFileSync(file, 'utf8')
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.readFile(string, source)
                .then(function(result) {
                    chai.expect(result).eq(compare)
                    done()
                })
        })
        it('nest templates', function (done) {
            var file = __dirname + '/test-data/test-file3.txt'
            var source = {
                name: {
                    first: 'Joe',
                    last: 'Exotic'
                },
                framed: {
                    JoeExotic: 'Carol Baskin'
                }
            }
            var compare = fs.readFileSync(__dirname + '/test-data/test-file4.txt', 'utf8')
            templatize.file.readFile(file, source)
                .then(function(result) {
                    chai.expect(result).eq(compare)
                    done()
                })
        })
    })
    describe('writeFile', function() {
        it('read from file', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.writeFile(writeTo, file, source)
                .then(function() {
                    var result = fs.readFileSync(writeTo, 'utf8')
                    chai.expect(result).eq(compare)
                    fs.unlinkSync(writeTo)
                    done()
                })
        })
        it('pass string', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var string = fs.readFileSync(file, 'utf8')
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.writeFile(writeTo, string, source)
                .then(function() {
                    var result = fs.readFileSync(writeTo, 'utf8')
                    chai.expect(result).eq(compare)
                    fs.unlinkSync(writeTo)
                    done()
                })
        })
        it('nest templates', function (done) {
            var file = __dirname + '/test-data/test-file3.txt'
            var source = {
                name: {
                    first: 'Joe',
                    last: 'Exotic'
                },
                framed: {
                    JoeExotic: 'Carol Baskin'
                }
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var compare = fs.readFileSync(__dirname + '/test-data/test-file4.txt', 'utf8')
            templatize.file.writeFile(writeTo, file, source)
                .then(function() {
                    var result = fs.readFileSync(writeTo, 'utf8')
                    chai.expect(result).eq(compare)
                    fs.unlinkSync(writeTo)
                    done()
                })
        })
    })
    describe('writeFileSync', function() {
        it('read from file', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.writeFileSync(writeTo, file, source)
            var result = fs.readFileSync(writeTo, 'utf8')
            chai.expect(result).eq(compare)
            fs.unlinkSync(writeTo)
            done()
        })
        it('pass string', function (done) {
            var file = __dirname + '/test-data/test-file1.txt'
            var source = {
                name: 'bob',
                addresses: ['somewhere']
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var string = fs.readFileSync(file, 'utf8')
            var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
            templatize.file.writeFileSync(writeTo, string, source)
            var result = fs.readFileSync(writeTo, 'utf8')
            chai.expect(result).eq(compare)
            fs.unlinkSync(writeTo)
            done()
        })
        it('nest templates', function (done) {
            var file = __dirname + '/test-data/test-file3.txt'
            var source = {
                name: {
                    first: 'Joe',
                    last: 'Exotic'
                },
                framed: {
                    JoeExotic: 'Carol Baskin'
                }
            }
            var writeTo = __dirname + '/test-data/tmp.txt'
            var compare = fs.readFileSync(__dirname + '/test-data/test-file4.txt', 'utf8')
            templatize.file.writeFileSync(writeTo, file, source)
            var result = fs.readFileSync(writeTo, 'utf8')
            chai.expect(result).eq(compare)
            fs.unlinkSync(writeTo)
            done()
        })
    })
})
