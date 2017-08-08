module.exports = function headerPlugin (opts, last) {
    if (!opts.header) {
        return last
    } 
    var newResponse = opts.responseDetail.response

    Object.assign(newResponse.header, opts.header)

    return {
        response: newResponse
    }

}