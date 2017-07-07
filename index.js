const anyproxy = require('./lib/anyproxy')
const resolve = require('path').resolve
const program = require('commander')

program
    .version('0.0.1')
    .option('-c, --config [config]', 'path of the config file')
    .parse(process.argv)

let config = {}

if (program.config) {
    try {
        const confPath = resolve(program.config)
        config = require(confPath)
        
        if (config.rule && config.rule.mock) {
            config.rule.mock = resolve(confPath, '..', config.rule.mock)
        }

        anyproxy.start(config)
    } catch(err) {
        console.log(err.message)
    }
} else {
    console.log('error:', '指定一个配置文件吧~')
}


