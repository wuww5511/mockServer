module.exports = function (opts, last) {
    if (!opts.header) {
        return last
    }

    var newRequestOptions = (
        last && last.requestOptions || requestDetail.requestOptions
    )
    
    Object.assign(newRequestOptions.headers, opts.header)

    return last ? Object.assign({}, last, {
        requestOptions: newRequestOptions
    }) : {
        requestOptions: newRequestOptions
    }
}