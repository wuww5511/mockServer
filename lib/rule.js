var util = require('../util')

var includeDecorator = require('../decorators/include')
var excludeDecorator = require('../decorators/exclude')
var delayDecorator = require('../decorators/delay')
var onlyReqDecorator = require('../decorators/onlyReq')
var onlyResDecorator = require('../decorators/onlyRes')

var pluginMock = require('../plugins/mock')
var pluginDummy = require('../plugins/dummy')
var pluginProxy = require('../plugins/proxy')

var pluginMap = {
     mock: util.applyDecorators(
        [
            onlyReqDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginMock
    ),
    proxy: util.applyDecorators(
        [
            onlyReqDecorator, 
            includeDecorator, 
            excludeDecorator, 
            delayDecorator
        ], 
        pluginProxy
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
        var plugins = arrs.map(function (pluginConf) {
            return function (opts, last) {
                var name = pluginConf.name
                var plugin = pluginDummy
                if (pluginMap[name]) {
                    plugin = pluginMap[name]
                } else if (typeof name === 'function') {
                    plugin = name
                }

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
            }
        })

        return Promise.resolve().then(function () {
            return util.applyPlugin(plugins, null, null)
        }).then(function (res) {
            return res
        })
    }
}


