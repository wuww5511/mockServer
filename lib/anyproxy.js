const AnyProxy = require('anyproxy')
const genRule = require('./rule').genRule
const options = {
    port: 8001,
    webInterface: {
        enable: true,
        webPort: 8002,
        wsPort: 8003
    },
    forceProxyHttps: false,
    silent: false
}

module.exports.start = function (opts) {
    options.rule = genRule(opts.rule)
    const server = new AnyProxy.ProxyServer(Object.assign(options, opts.anyproxy || {}))
    server.start()
    return server
}