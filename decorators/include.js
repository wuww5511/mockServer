var logger = require('../util/log')

module.exports = function (opts, last, meta) {
    return new Promise(function (resolve, reject) {
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
                reject()
            }
        }
        resolve()
    }).then(function () {
        logger.info(meta + '_includeDecorator_pass:', opts.url)
    }).catch(function () {
        logger.info(meta + '_includeDecorator_forbidden:', opts.url)
    })
}
