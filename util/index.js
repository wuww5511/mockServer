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

exports.useDecorators = function useDecorators (decorators, plugin) {
    var tempPlugin = plugin

    for (var i = decorators.length - 1; i >= 0; i--) {
        tempPlugin = exports.decoratePlugin(decorators[i], tempPlugin)
    }

    return tempPlugin
}


exports.usePlugin = function usePlugin (plugins, opts, initial) {
    var actions = []
    plugins.forEach(function (plugin, index) {
        actions.push(function (last) {
            return Promise.resolve(initial).then(function () {
                return last
            }).then(function (res) {
                if (res === false) {
                    return plugin(opts, res)
                } else {
                    return res
                }
            })
        })
    })
    return exports.reducePromise(actions, false).then(function (res) {
        return res === null? false : res 
    })
}