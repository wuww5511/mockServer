var url = require('url')
var logger = require('../util/log')

module.exports = function (opts, last) {
    var proxy = opts.proxy
    if (!proxy) {
        return false
    }
    
    for (var i in proxy) {
        var reg = i instanceof RegExp ? i : new RegExp(i)
        if (reg.test(opts.url)) {
            var map = {}
            for (var j = 1; j < 10; j++) {
                map['$' + j] = RegExp['$' + j]
            }
            
            var reg = /\[(.*?)\]/g
            var realUrl = proxy[i].replace(reg, function (str, $1) {
                return map[$1] || str
            })

            var urlObj = url.parse(realUrl)

            logger.info('proxyPlugin:', opts.url, '->', realUrl)
            
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