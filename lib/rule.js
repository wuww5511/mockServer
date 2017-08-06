const http = require('http')
const url = require('url')
const Mock = require('mockjs')
const logger = require('../util/log')
const util = require('../util')

const pluginMap = {
    mock: [useInclude, useExclude, useMock],
    proxy: [useInclude, useExclude, useProxy],
    headers: [useInclude, useExclude],
    rewrite: [useInclude, useExclude]
}

exports.pluginMap = pluginMap
exports.genRule = genRule
exports.usePlugin = usePlugin
exports.useInclude = useInclude
exports.useExclude = useExclude
exports.useMock = useMock
exports.useProxy = useProxy

function genRule (arrs) {
    arrs = arrs || []
    const rule = {
        beforeSendRequest: function (requestDetail) {
            var plugins = arrs.map(function (pluginConf) {
                return function () {
                    var name = pluginConf.name
                    var plugins = []
                    if (pluginMap[name]) {
                        plugins = pluginMap[name]
                    } else if (typeof name === 'function') {
                        plugins = [useInclude, useExclude, name]
                    }
                    return usePlugin(plugins, Object.assign({}, pluginConf, {
                        url: requestDetail.url,
                        requestDetail: requestDetail
                    }))    
                }
            })

            return usePlugin(plugins)
            
        }
    }
    return rule
}

/**
 * 
 * @param {Object} opts 配置项 
 * @param {*} plugins
 */
function usePlugin (plugins, opts) {
    var actions = []
    plugins.forEach(function (plugin) {
        actions.push(function (last) {
            return Promise.resolve().then(function () {
                return last
            }).then(function (res) {
                if (res === false) {
                    return plugin(opts)
                } else {
                    return res
                }
            })
        })
    })
    return util.reducePromise(actions, false)
}

function useInclude (opts) {
    var includes = opts.include || []
    if (includes.length > 0) {
        var next = false
        for(var i = 0; i < includes.length; i++) {
            if (new RegExp(includes[i]).test(opts.url)) {
                logger.info(opts.url)
                next = true
                break
            }
        }
        if (!next) {
            return Promise.resolve(null)
        }
    }

    return false
}

function useExclude (opts) {
    var excludes = opts.exclude || []
    var next = true
    for (var i = 0; i < excludes.length; i++) {
        if (new RegExp(excludes[i]).test(opts.url)) {
            next = false
            break
        }
    }
    if (!next) {
        return Promise.resolve(null)
    } else {
        return false
    }
}

function useMock (opts) {
    const header = {'Content-Type': 'application/json'}
    if (opts.mock) {
        var mock = opts.mock
        if (typeof mock === 'string') {
            delete require.cache[mock]
            mock = require(mock)
        }
        
        if (typeof mock === 'function') {
            return Promise.resolve().then(function () {
                return mock(opts)
            }).then(function (data) {
                if (data === false) {
                    return false
                } else {
                    var response = {
                        header: header,
                        statusCode: 200,
                        body: JSON.stringify(
                            Mock.mock(data)
                        )
                    }
                    
                    return Promise.resolve(({
                        response: response
                    }))    
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
                        return {
                            response: {
                                statusCode: 200,
                                header: header,
                                body: JSON.stringify(
                                    Mock.mock(data)
                                )
                            }
                        }
                    })
                }
            }    
        }
        
    }
    return false
}

function useProxy (opts) {
    var proxy = opts.proxy
    if (!proxy) {
        return false
    }
    logger.info('use proxy')
    var urlObj = url.parse(opts.proxy)

    return new Promise(function (resolve, reject) {
        var requestOptions = Object.assign({}, opts.requestDetail.requestOptions, {
            hostname: urlObj.hostname,
            port: urlObj.port
        })
        const request = http.request(requestOptions)
        let chunks = []
        request.on('response', function (incomingMessage) {
            incomingMessage.on('data', function (chunk) {
                chunks.push(chunk)
            })
            incomingMessage.on('end', function () {
                resolve({
                    response: {
                        statusCode: incomingMessage.statusCode,
                        body: Buffer.concat(chunks),
                        header: incomingMessage.headers
                    }
                })
            })
        })
        request.on('error', function (err) {
            console.log('error: ', err.message)
            resolve(null)
        })
        request.end(opts.requestDetail.requestData)
    })
}
