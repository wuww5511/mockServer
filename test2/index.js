const anyproxy = require('../lib/anyproxy')
const resolve = require('path').resolve
const logger = require('../util/log')

anyproxy.start(resolve(__dirname, './rule.js'))

/* const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

rl.question('?\n', answer => {
    console.log(answer)
    rl.close()
}) */