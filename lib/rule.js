const http = require('http')
const url = require('url')
const Mock = require('mockjs')
const logger = require('../util/log')
const util = require('../util')
const path = require('path')

const defaultPlugin = [useInclude, useExclude]

const pluginMap = {
    mock: useMock,
    proxy: useProxy
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
                    var subPlugins = []
                    if (pluginMap[name]) {
                        subPlugins = defaultPlugin.concat([pluginMap[name]])
                    } else if (typeof name === 'function') {
                        subPlugins = defaultPlugin.concat([name])
                    } else {
                        logger.error('cannot find plugin:', name)
                    }
                    return usePlugin(subPlugins, Object.assign({}, pluginConf, {
                        url: requestDetail.url,
                        requestDetail: requestDetail
                    }), name)    
                }
            })

            return Promise.resolve().then(function () {
                return usePlugin(plugins)
            }).then(function (res) {
                return res === false ? null : res
            })
            
        }
    }

    return rule
}

/**
 * 
 * @param {Object} opts 配置项 
 * @param {*} plugins
 */
function usePlugin (plugins, opts, id) {
    var actions = []
    plugins.forEach(function (plugin, index) {
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
    return util.reducePromise(actions, false).then(function (res) {
        return res === null? false : res 
    })
}

function useInclude (opts) {
    var includes = opts.include || []
    if (includes.length > 0) {
        var next = false
        for(var i = 0; i < includes.length; i++) {
            if (new RegExp(includes[i]).test(opts.url)) {
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
            var realPath = 
            delete require.cache[mock]
            mock = require(mock)
        }

        logger.info('useMock:', opts.url)
        
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
    
    for (var i in proxy) {
        if (new RegExp(i).test(opts.url)) {
            var map = {}
            for (var j = 1; j < 10; j++) {
                map['$' + j] = RegExp['$' + j]
            }
            
            var reg = /\[(.*?)\]/g
            var realUrl = proxy[i].replace(reg, function (str, $1) {
                return map[$1] || str
            })

            var urlObj = url.parse(realUrl)

            logger.info('useProxy', 'match:', i, 'url', opts.url)

            if (urlObj.protocol === 'https:') {
                logger.warn('只支持同域名的https转发')
            } 
            return {
                requestOptions: Object.assign(
                    {}, 
                    opts.requestDetail.requestOptions, 
                    {path: urlObj.path, hostname: urlObj.hostname, port: urlObj.port || 80}
                ),
                protocol: urlObj.protocol
            }
        }
    }

    return false
}
