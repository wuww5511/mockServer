const anyproxy = require('./lib/anyproxy')
const resolve = require('path').resolve
const program = require('commander')
const packageJson = require('./package.json')
const genConfig = require('./lib/genConfig')
const logger = require('./util/log')
const fs = require('fs-extra')

program
    .version(packageJson.version)
    .option('-c, --config [config]', 'path of the config file')
    .parse(process.argv)

if (program.config) {
   anyproxy.start(program.config)
} else {
    const defaultConfig = resolve(process.cwd(), './mock_server/rule.js')
    fs.pathExists(defaultConfig)
        .then(function (exists) {
            if (exists) {
                anyproxy.start(defaultConfig)
            } else {
                logger.info('未找到配置文件，将在当前目录生成...')
                genConfig(
                    resolve(process.cwd(), './mock_server')
                ).then(() => {
                    logger.info('生成配置文件:', defaultConfig)
                    anyproxy.start(defaultConfig)
                })
            }
        })
    
}


