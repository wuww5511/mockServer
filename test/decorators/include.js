var assert = require('assert')
var includeDecorator = require('../../decorators/include')

describe('test includeDecorator', function () {
    it('include catched', function (done) {
        includeDecorator({
            include: ['/a'],
            url: '/a'
        }, null).then(function () {
            done()
        })
    })

    it('include', function (done) {
        includeDecorator({
            include: ['/a'],
            url: '/b'
        }, null).catch(function () {
            done()
        })
    })

    it('no include', function (done) {
        includeDecorator({}, null).then(function () {
            done()
        })
    })
})