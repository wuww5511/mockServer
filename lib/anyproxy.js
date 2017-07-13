const AnyProxy = require('anyproxy')
const genRule = require('./rule').genRule
const resolve = require('path').resolve

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

module.exports.start = function (input) {
    let opts
    try {
        const confPath = resolve(input)
        config = require(confPath)
        
        if (config.rule && config.rule.mock) {
            config.rule.mock = resolve(confPath, '..', config.rule.mock)
        }
        opts = config
    } catch(err) {
        console.log(err.message)
        return
    }
    options.rule = genRule(opts.rule)
    if (opts.anyproxy && opts.anyproxy.forceProxyHttps === true) {
        if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
            AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
                if (!error) {
                    console.log('自动生成证书完成')
                } else {
                    console.error('生成证书失败', error);
                }
            });
        }
    }
    const server = new AnyProxy.ProxyServer(Object.assign(options, opts.anyproxy || {}))
    server.start()
    return server
}