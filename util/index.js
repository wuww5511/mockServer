exports.reducePromise = function (funcs, defaultValue) {
    var promise = Promise.resolve(defaultValue)
    funcs.forEach(function (func) {
        promise = promise.then(function (res) {
            return func(res)
        })
    })
    return promise
}