var logger = require('../util/log')

module.exports = function (opts, last, meta) {
    return new Promise(function (resolve, reject) {
        var excludes = opts.exclude || []
        var next = true
        for (var i = 0; i < excludes.length; i++) {
            if (new RegExp(excludes[i]).test(opts.url)) {
                next = false
                break
            }
        }
        if (!next) {
            reject()
        } else {
            resolve()
        }
    }).catch(function () {
        logger.info(meta + '_excludeDecorator_forbidden:', opts.url)
    })
}