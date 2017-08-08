module.exports = function useProxy (opts) {
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