module.exports = function (opts, last) {
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
    })
}