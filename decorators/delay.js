module.exports = function (opts, last) {
    if (!opts.delay) {
        return Promise.resolve()
    }
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve()
        }, opts.delay)
    })
}