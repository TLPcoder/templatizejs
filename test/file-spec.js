var fs = require('fs')
var chai = require('chai')
var templatize = require('../index')
var isNode

if (process !== undefined) {
    isNode = true
}

describe('templatize File', function () {
    it('first', function () {
        var file = __dirname + '/test-data/test-file1.txt'
        var source = {
            name: 'bob',
            addresses: ['somewhere']
        }
        var compare = fs.readFileSync(__dirname + '/test-data/test-file2.txt', 'utf8')
        var result = templatize.file(file, source)
        chai.expect(result).eq(compare)
    })
})
