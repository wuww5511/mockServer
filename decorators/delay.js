var logger = require('../util/log')

module.exports = function (opts, last, meta) {
    if (!opts.delay) {
        return Promise.resolve()
    }
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve()
        }, opts.delay)
    }).then(function () {
        logger.info(meta + '_delayDecorator:', opts.url, opts.delay + 'ms')
    })
}