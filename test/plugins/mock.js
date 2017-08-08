var assert = require('assert')
var mockPlugin = require('../../plugins/mock')
var logger = require('../../util/log')

logger.level = 'error'

describe('test mockPlugin', function () {

    it('no last no opts', function (done) {
        Promise.resolve().then(function () {
            return mockPlugin({}, false)
        }).then(function (res) {
            assert.equal(res, false)
            done()
        })
    })

    it('no opts', function (done) {
        var last = {}
        Promise.resolve().then(function () {
            return mockPlugin({}, last)
        }).then(function (res) {
            assert.equal(res, last)
            done()
        })
    })

    it('no last', function (done) {
        Promise.resolve().then(function () {
            return mockPlugin({
                mock: {
                    '/test': {
                        a: 1
                    }
                },
                url: 'http://a.com/test'
            }, false)
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {a: 1})
            done()
        })
    })

    it('plainObject', function (done) {
        Promise.resolve().then(function () {
            return mockPlugin(
                {mock: {'/b': {a: 1}}, url: 'http://a.com/b'}
            )
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {a: 1})
            done()
        })
    })

    it('last', function (done) {
        Promise.resolve().then(function () {
            return mockPlugin(
                {mock: {'/b': {a: 1}}, url: 'http://a.com/b'},
                {a: 1, response: {b: 1, headers: {c: 1}}}
            )
        }).then(function (res) {
            var body = res.response.body
            assert.deepEqual(res, {
                a: 1,
                response: {
                    b: 1,
                    statusCode: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        c: 1
                    },
                    body: body
                }
            })
            done()
        })
    })

    it('plainObject:pass', function (done) {
        var last = {}
        Promise.resolve().then(function () {
            return mockPlugin(
                {mock: {}, url: 'https://a.com'},
                last
            )
        }).then(function (res) {
            assert.equal(last, res)
            assert.deepEqual(res, {})
            done()
        })
    })


    it('function:mock', function (done) {
        Promise.resolve().then(function () {
            return mockPlugin(
                {
                    mock: function (opts) {
                        var url = opts.url
                        return {
                            a: url
                        }
                    },
                    url: 'http://a.com'
                }
            )
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {a: 'http://a.com'})
            done()
        })
    })

    it('function:pass', function (done) {
        var last = {}
        Promise.resolve().then(function () {
            return mockPlugin(
                {
                    mock: function (opts) {
                       return Promise.resolve(false)
                    },
                    url: ''
                },
                last
            )
        }).then(function (res) {
            assert.equal(last, res)
            // assert.deepEqual(res, {})
            done()
        })
    })
})