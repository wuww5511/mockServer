var assert = require('assert')
var delayDecorator = require('../../decorators/delay')

describe('test delayDecorator', function () {
    it('delay', function (done) {
        delayDecorator({delay: 20}, null).then(function () {
            done()
        })
    })

    it('no delay', function (done) {
        delayDecorator({}, null).then(function () {
            done()
        })
    })
})