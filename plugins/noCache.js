var resHeader = require('./resHeader')

module.exports = function (opts, last) {
    opts.header = opts.header || {}
    opts.header['Cache-Control'] = 'no-store'
    opts.header['Expires'] = 'Thu, 01 Jan 1970 00:00:00 GMT'
    opts.header['Pragma'] = 'no-cache'
    return resHeader(opts, last)
}