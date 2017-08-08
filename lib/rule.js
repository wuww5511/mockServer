var util = require('../util')

var includeDecorator = require('../decorators/include')
var excludeDecorator = require('../decorators/exclude')
var delayDecorator = require('../decorators/delay')

var pluginMock = require('../plugins/mock')
var pluginDumy = require('../plugins/dummy')

var beforeSendRequestPluginMap = {
     mock: util.useDecorators(
        [includeDecorator, excludeDecorator, delayDecorator], 
        pluginMock
    ) 
}

var beforeSendResponsePluginMap = {}


exports.genRule = genRule

function genRule (arrs) {
    arrs = arrs || []
    const rule = {
        beforeSendRequest: genAnyproxyCallback(
            beforeSendRequestPluginMap,
            arrs
        )/* ,
        beforeSendResponse: genAnyproxyCallback(
            beforeSendResponsePluginMap,
            arrs
        ) */
    }

    return rule
}

function genAnyproxyCallback (pluginMap, arrs) {
    return function (requestDetail, responseDetail) {
        var plugins = arrs.map(function (pluginConf) {
            return function (opts, last) {
                var name = pluginConf.name
                var plugin = pluginDumy
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
            return util.usePlugin(plugins, null, null)
        }).then(function (res) {
            return res
        })
    }
}


