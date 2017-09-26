var logger = require('../util/log')

module.exports = function (opts, last) {
    if (!opts.header) {
        return last
    } 
    var newResponse = (
        last && last.response || opts.responseDetail.response
    )

    logger.info('pluginResHeader:', opts.url)

    Object.assign(newResponse.header, opts.header)

    for (var key in newResponse.header) {
        if (!newResponse.header[key]) {
            delete newResponse.header[key]
        }
    }

    return {
        response: newResponse
    }

}