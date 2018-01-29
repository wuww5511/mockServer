exports.reducePromise = function reducePromise (funcs, defaultValue) {
    var promise = Promise.resolve(defaultValue)
    funcs.forEach(function (func) {
        promise = promise.then(function (res) {
            return func(res)
        })
    })
    return promise
}

exports.decoratePlugin = function decoratePlugin (decorator, plugin, meta) {
    return function (opts, last) {
        return new Promise(function (resolve, reject) {
            decorator(opts, last, meta).then(function () {
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
        tempPlugin = exports.decoratePlugin(decorators[i], tempPlugin, meta)
    }

    return function () {
        // meta ? console.log(meta) : null
        return tempPlugin.apply(null, arguments)
    }
}

/**
 * 依次执行一组plugin（每一个plugin返回一个promise, 前一个plugin的promise resolve后，后一个plugin 才会执行。如果前一个plugin的promise reject，则程序报错退出）
 * @param {Array} plugins 
 * @param {Object} opts 作为参数，传递每一个plugin
 */
exports.applyPlugin = function usePlugin (plugins, opts) {
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
    return exports.reducePromise(actions)
}