var assert = require('assert')
var excludeDecorator = require('../../decorators/exclude')

describe('test excludeDecorator', function () {
    it('exclude catched', function (done) {
        excludeDecorator({
            exclude: ['/a'],
            url: '/a'
        }, null).catch(function () {
            done()
        })
    })

    it('exclude', function (done) {
        excludeDecorator({
            exclude: ['/a'],
            url: '/b'
        }, null).then(function () {
            done()
        })
    })

    it('no exclude', function (done) {
        excludeDecorator({}, null).then(function () {
            done()
        })
    })
})