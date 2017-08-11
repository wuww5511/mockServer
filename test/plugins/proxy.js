var assert = require('assert')
var pluginProxy = require('../../plugins/proxy')

describe('pluginProxy:', function () {
    it('str', function (done) {
        Promise.resolve().then(function () {
            return pluginProxy({
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

    it('reg', function (done) {
        Promise.resolve().then(function () {
            return pluginProxy({
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
})