var logger = require('../util/log')
var Mock = require('mockjs')
module.exports = function pluginMock (opts, last) {
    var response = last && last.response || {}
    var headers = Object.assign(
        {},
        response.headers, 
        {'Content-Type': 'application/json'}
    )
    var statusCode = response.statusCode || 200

    if (!opts.mock || statusCode !== 200) {
        return last
    }

    var mock = opts.mock

    if (typeof mock === 'string') {
        var realPath = 
        delete require.cache[mock]
        mock = require(mock)
    }

    logger.info('useMock:', opts.url)
    
    if (typeof mock === 'function') {
        return Promise.resolve().then(function () {
            return mock(opts)
        }).then(function (data) {
            if (!data) {
                return last
            } else {
                response.headers = headers
                response.statusCode = statusCode
                response.body = JSON.stringify(
                    Mock.mock(data)
                )
                
                return Promise.resolve(
                    Object.assign(
                        last || {}, 
                        {response: response}
                    )
                )    
            }
        })
    } else if (typeof mock === 'object') {
        for (var i in mock) {
            if (new RegExp(i).test(opts.url)) {
                return Promise.resolve().then(function () {
                    if (typeof mock[i] === 'function') {
                        return mock[i].call(null, opts)
                    } else {
                        return mock[i]
                    }
                }).then(function (data) {
                    response.headers = headers
                    response.statusCode = statusCode
                    response.body = JSON.stringify(
                        Mock.mock(data)
                    )
                    return Promise.resolve(
                        Object.assign(last || {}, {response: response})
                    )  
                })
            }
        }    
    }
    
    
    return last
}