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
exports.useInclude = useInclude
exports.useExclude = useExclude
exports.useMock = useMock
exports.useProxy = useProxy

function genRule (arrs) {
    arrs = arrs || []
    const rule = {
        beforeSendRequest: function (requestDetail) {
            var plugins = arrs.map(function (pluginConf) {
                return function (opts, requestDetail) {
                    var name = pluginConf.name
                    var plugins = []
                    if (pluginMap[name]) {
                        plugins = pluginMap[name]
                    } else if (typeof name === 'function') {
                        plugins = [useInclude, useExclude, name]
                    }
                    return usePlugin(pluginConf, requestDetail, plugins)    
                }
            })

            return usePlugin(null, requestDetail, plugins)
            
        }
    }
    return rule
}

/**
 * 
 * @param {Object} opts 配置项 
 * @param {*} requestDetail  
 * @param {*} plugins
 */
function usePlugin (opts, requestDetail, plugins) {
    var actions = []
    plugins.forEach(function (plugin) {
        actions.push(function (last) {
            if (last === false) {
                return plugin(opts, requestDetail)
            } else {
                return last
            }
        })
    })
    return util.reducePromise(actions, false)
}

function useInclude (opts, requestDetail) {
    var includes = opts.include || []
    if (includes.length > 0) {
        var next = false
        for(var i = 0; i < includes.length; i++) {
            if (new RegExp(includes[i]).test(requestDetail.url)) {
                logger.info(requestDetail.url)
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

function useExclude (opts, requestDetail) {
    var excludes = opts.exclude || []
    var next = true
    for (var i = 0; i < excludes.length; i++) {
        if (new RegExp(excludes[i]).test(requestDetail.url)) {
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

function useMock (opts, requestDetail) {
    if (opts.mock) {
        var mock = opts.mock
        if (typeof mock === 'string') {
            delete require.cache[mock]
            mock = require(mock)
        }
        
        if (typeof mock === 'function') {
            var res = mock(requestDetail)
            if (res instanceof Promise) {
                return res.then(function (ret) {
                    if (ret === null) {
                        return ret
                    }
                    ret.header = ret.header || {}
                    ret.statusCode = ret.statusCode || 200
                    ret.body = ret.body || ''
                    return {
                        response: ret
                    }
                })
            } else {
                if (res === null) {
                    return Promise.resolve(null)
                }
                res.header = res.header || {}
                res.statusCode = res.statusCode || 200
                res.body = res.body || ''
                return Promise.resolve(({
                    response: res
                }))
            }
        }
        for (var i in mock) {
            if (new RegExp(i).test(requestDetail.url)) {
                return Promise.resolve().then(function () {
                    if (typeof mock[i] === 'function') {
                        return mock[i].call(null, requestDetail)
                    } else {
                        return mock[i]
                    }
                }).then(function (data) {
                    return {
                        response: {
                            statusCode: 200,
                            header: {'Content-Type': 'application/json'},
                            body: JSON.stringify(
                                Mock.mock(data)
                            )
                        }
                    }
                })
            }
        }
    }
    return false
}

function useProxy (opts, requestDetail) {
    var proxy = opts.proxy
    if (!proxy) {
        return false
    }
    logger.info('use proxy')
    var urlObj = url.parse(opts.proxy)

    return new Promise(function (resolve, reject) {
        var requestOptions = Object.assign({}, requestDetail.requestOptions, {
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
        request.end(requestDetail.requestData)

    })
}
