exports.reducePromise = function reducePromise (funcs, defaultValue) {
    var promise = Promise.resolve(defaultValue)
    funcs.forEach(function (func) {
        promise = promise.then(function (res) {
            return func(res)
        })
    })
    return promise
}

exports.decoratePlugin = function decoratePlugin (decorator, plugin) {
    return function (opts, last) {
        return new Promise(function (resolve, reject) {
            decorator(opts, last).then(function () {
                Promise.resolve().then(function () {
                    return plugin(opts, last)
                }).then(function (res) {
                    resolve(res)
                })
            }).catch(function () {
                resolve(last)
            })
        })
    }
}

exports.applyDecorators = function (decorators, plugin, meta) {
    var tempPlugin = plugin

    for (var i = decorators.length - 1; i >= 0; i--) {
        tempPlugin = exports.decoratePlugin(decorators[i], tempPlugin)
    }

    return function () {
        // meta ? console.log(meta) : null
        tempPlugin.apply(null, arguments)
    }
}


exports.applyPlugin = function usePlugin (plugins, opts, initial) {
    var actions = []
    plugins.forEach(function (plugin, index) {
        actions.push(function (last) {
            return Promise.resolve().then(function () {
                return last
            }).then(function (res) {
                return plugin(opts, res)
            })
        })
    })
    return exports.reducePromise(actions, initial)
}