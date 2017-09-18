const anyproxy = require('../lib/anyproxy')
const resolve = require('path').resolve
const logger = require('../util/log')

anyproxy.start(resolve(__dirname, './rule.js'))
