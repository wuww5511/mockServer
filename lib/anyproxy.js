const AnyProxy = require('anyproxy')
const genRule = require('./rule').genRule
const resolve = require('path').resolve
const logger = require('../util/log')

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
        logger.error(err.message)
        return
    }
    options.rule = genRule(opts.rule)
    if (opts.anyproxy && opts.anyproxy.forceProxyHttps === true) {
        if (!AnyProxy.utils.certMgr.ifRootCAFileExists()) {
            AnyProxy.utils.certMgr.generateRootCA((error, keyPath) => {
                if (!error) {
                    logger.info('自动生成证书完成')
                } else {
                    logger.error('生成证书失败', error);
                }
            });
        }
    }
    opts.anyproxy = opts.anyproxy || {}
    opts.anyproxy.port = opts.anyproxy.port || 8001
    opts.anyproxy.webInterface = opts.anyproxy.webInterface || {}
    opts.anyproxy.webInterface.enable = true
    opts.anyproxy.webInterface.webPort = opts.anyproxy.webInterface.webPort || 8002
    opts.anyproxy.webInterface.wsPort = opts.anyproxy.webInterface.wsPort || 8003
    const server = new AnyProxy.ProxyServer(Object.assign(options, opts.anyproxy))
    
    server.on('ready', function () {
        logger.info('服务器启动成功')
        logger.info('HTTP代理服务器端口为：', opts.anyproxy.port)
        logger.info('数据包展示服务器端口为：', opts.anyproxy.webInterface.webPort)
    })

    server.on('error', function (err) {
        logger.error(err.message)
    })

    server.start()
  
    return server
}