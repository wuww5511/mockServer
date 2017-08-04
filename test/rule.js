var rule = require('../lib/rule')
var logger = require('../util/log')
var assert = require('assert')

logger.level = 'error'

var useInclude = rule.useInclude
var useExclude = rule.useExclude
var useMock = rule.useMock

describe('rule', function () {

    it('useInclude:pass', function (done) {
        Promise.resolve().then(function () {
            return useInclude(
                {include: ['ba.com', '/b', 'test']}, 
                {url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert(res === false)
            done()
        })
    })

    it('useInclude:deny', function (done) {
        Promise.resolve().then(function () {
            return useInclude(
                {include: ['ba.com', '/bc', 'test']}, 
                {url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, null)
            done()
        })
    })

    it('useExclude:pass', function (done) {
        Promise.resolve().then(function () {
            return useExclude(
                {exclude: ['ba.com', '/bc', 'test']}, 
                {url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, false)
            done()
        })
    })

    it('useExclude:deny', function (done) {
        Promise.resolve().then(function () {
            return useExclude(
                {exclude: ['ba.com', '/b', 'test']}, 
                {url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, null)
            done()
        })
    })

    it('useMock:plainObject:mock', function (done) {
        Promise.resolve().then(function () {
            return useMock(
                {mock: {'/a': {a: 1}}},
                {url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {a: 1})
            done()
        })
    })
})