const anyproxy = require('./lib/anyproxy')
const resolve = require('path').resolve
const program = require('commander')

program
    .version('0.0.1')
    .option('-c, --config [config]', 'path of the config file')
    .parse(process.argv)

let config = {}

if (program.config) {
   anyproxy.start(program.config)
} else {
    console.log('error:', '指定一个配置文件吧~')
}


