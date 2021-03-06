var util = require('../util')

var includeDecorator = require('../decorators/include')
var excludeDecorator = require('../decorators/exclude')
var delayDecorator = require('../decorators/delay')
var onlyReqDecorator = require('../decorators/onlyReq')
var onlyResDecorator = require('../decorators/onlyRes')

var pluginMock = require('../plugins/mock')
var pluginDummy = require('../plugins/dummy')
var pluginProxy = require('../plugins/proxy')
var pluginReqHeader = require('../plugins/reqHeader')
var pluginResHeader = require('../plugins/resHeader')
var pluginNoCache = require('../plugins/noCache')

var pluginMap = {
     mock: util.applyDecorators(
        [
            onlyReqDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginMock,
        'mockPlugin'
    ),
    proxy: util.applyDecorators(
        [
            onlyReqDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginProxy,
        'proxyPlugin'
    ),
    resHeader: util.applyDecorators(
        [
            onlyResDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginResHeader,
        'resHeaderPlugin'
    ),
    reqHeader: util.applyDecorators(
        [
            onlyReqDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginReqHeader,
        'reqHeaderPlugin'
    ),
    noCache: util.applyDecorators(
        [
            onlyResDecorator,
            includeDecorator,
            excludeDecorator
        ],
        pluginNoCache,
        'noCachePlugin'
    )
}

exports.genRule = genRule

function genRule (arrs) {
    arrs = arrs || []
    const rule = {
        beforeSendRequest: genAnyproxyCallback(
            pluginMap,
            arrs
        ),
        beforeSendResponse: genAnyproxyCallback(
            pluginMap,
            arrs
        ) 
    }

    return rule
}

function genAnyproxyCallback (pluginMap, arrs) {
    return function (requestDetail, responseDetail) {
        var pluginNames = []
        var plugins = arrs.map(function (pluginConf) {
            return function (opts, last) {
                var name = pluginConf.name

                pluginNames.push(name)

                var plugin = pluginDummy
                if (pluginMap[name]) {
                    plugin = pluginMap[name]
                } else if (typeof name === 'function') {
                    plugin = name
                }

                return Promise.resolve().then(function () {
                    return plugin(
                        Object.assign(
                            {}, 
                            pluginConf,
                            {
                                url: requestDetail.url,
                                requestDetail: requestDetail,
                                responseDetail: responseDetail
                            }
                        ),
                        last
                    )    
                }).then(function (res) {
                    //console.log(res)
                    return res
                })
            }
        })

        

        return Promise.resolve().then(function () {
            return util.applyPlugin(plugins, null)
        }).then(function (res) {
            // console.log('pluginApplied:', pluginNames)
            // console.log('res:', res)
            return res
        })
    }
}


