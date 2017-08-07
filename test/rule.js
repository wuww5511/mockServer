var rule = require('../lib/rule')
var logger = require('../util/log')
var assert = require('assert')

logger.level = 'error'

var useInclude = rule.useInclude
var useExclude = rule.useExclude
var useMock = rule.useMock
var usePlugin = rule.usePlugin
var useProxy = rule.useProxy

describe('rule', function () {

    it('useInclude:pass', function (done) {
        Promise.resolve().then(function () {
            return useInclude(
                {include: ['ba.com', '/b', 'test'], url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert(res === false)
            done()
        })
    })

    it('useInclude:deny', function (done) {
        Promise.resolve().then(function () {
            return useInclude(
                {include: ['ba.com', '/bc', 'test'], url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, null)
            done()
        })
    })

    it('useExclude:pass', function (done) {
        Promise.resolve().then(function () {
            return useExclude(
                {exclude: ['ba.com', '/bc', 'test'], url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, false)
            done()
        })
    })

    it('useExclude:deny', function (done) {
        Promise.resolve().then(function () {
            return useExclude(
                {exclude: ['ba.com', '/b', 'test'], url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.equal(res, null)
            done()
        })
    })

    it('useMock:plainObject:mock', function (done) {
        Promise.resolve().then(function () {
            return useMock(
                {mock: {'/bc': {a: 1}, '/a': {b: 1}}, url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {b: 1})
            done()
        })
    })

    it('useMock:plainObject:pass', function (done) {
        Promise.resolve().then(function () {
            return useMock(
                {mock: {'/bc': {a: 1}, '/ad': {b: 1}}, url: 'https://a.com/a/b/c'}
            )
        }).then(function (res) {
            assert(res === false)
            done()
        })
    })


    it('useMock:function:mock', function (done) {
        Promise.resolve().then(function () {
            return useMock(
                {
                    mock: function (opts) {
                        var url = opts.url
                        return {
                            a: url
                        }
                    },
                    url: 'https://a.com/a/b/c'
                }
            )
        }).then(function (res) {
            assert.deepEqual(JSON.parse(res.response.body), {a: 'https://a.com/a/b/c'})
            done()
        })
    })

    it('useMock:function:pass', function (done) {
        Promise.resolve().then(function () {
            return useMock(
                {
                    mock: function (opts) {
                       return Promise.resolve(false)
                    },
                    url: 'https://a.com/a/b/c'
                }
            )
        }).then(function (res) {
            assert.equal(res, false)
            done()
        })
    })

    it('useProxy:str', function (done) {
        Promise.resolve().then(function () {
            return useProxy({
                proxy: {
                    '/test': 'http://baidu.com/a'
                },
                url: 'http://b.com/test',
                requestDetail: {
                    requestOptions: {}
                }
            })
        }).then(function (res) {
            assert.deepEqual(res, {
                protocol: 'http:',
                requestOptions: {
                    path: '/a',
                    hostname: 'baidu.com',
                    port: 80
                }
            })
            done()
        })
    })

    it('useProxy:reg', function (done) {
        Promise.resolve().then(function () {
            return useProxy({
                proxy: {
                    'a.com/reader(\\d+)/id([a-z]*)': 'http://b.com/[$1]/[$2]'
                },
                url: 'http://a.com/reader1234/idhelloworld',
                requestDetail: {
                    requestOptions: {}
                }
            })
        }).then(function (res) {
            assert.deepEqual(res, {
                protocol: 'http:',
                requestOptions: {
                    path: '/1234/helloworld',
                    hostname: 'b.com',
                    port: 80
                }
            })
            done()
        })
    })

    it('usePlugin', function (done) {
        var opts = {}
        var plugins = [
            function (o) {
                assert.equal(o, opts)
                return false
            },
            function (o) {
                assert.equal(o, opts)
                return Promise.resolve(false)
            },
            function (o) {
                assert.equal(o, opts)
                return Promise.resolve({a: 1})
            },
            function (o) {
                assert.equal(o, opts)
                return Promise.resolve({b: 1})
            }
        ]

        usePlugin(plugins, opts).then(function (res) {
            assert.deepEqual(res, {a: 1})
            done()
        })
    })
})