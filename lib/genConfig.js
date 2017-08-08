var fs = require('fs-extra')
var path = require('path')

function genConfig (destination) {
    var files = ['rule.js']
    var source = path.resolve(__dirname, '../template')
    var copys = []
    files.forEach(function (file) {
        copys.push(
            fs.copy(
                path.resolve(source, file),
                path.resolve(destination, file)
            )
        )
    })
    return Promise.all(copys)
}

module.exports = genConfig