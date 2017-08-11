module.exports = function (opts, last) {
    if (!opts.responseDetail) {
        return Promise.reject()
    } else {
        return Promise.resolve()
    }
}