var assert = require('assert')
var util = require('../util')

describe('test util', function () {
    it('reducePromise', function (done) {
        var records = []
        var promises = [
            function (last) {
                return genPromise(1, 10).then(function (res) {
                    var value = res + last
                    records.push(value)
                    return value
                })    
            },
            function (last) {
                return genPromise(2, 0).then(function (res) {
                    var value = res + last
                    records.push(value)
                    return value
                })    
            },
            function (last) {
                var value = 3 + last
                records.push(value)
                return value
            }
        ]
        
        util.reducePromise(promises, 3).then(function (res) {
            assert.deepEqual(records, [4, 6, 9])
            assert.equal(res, 9)
            done()
        })
    })
})

function genPromise (ret, delay) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve(ret)
        }, delay)
    })
}