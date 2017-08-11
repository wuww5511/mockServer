module.exports = {
    "plugins": [
        {
            name: 'mock',
            include: ['/mock'],
            mock: require('path').resolve(__dirname, './mock.js'),
            delay: 0
        },
        {
            name: 'proxy',
            include: ['/proxy', 'proxy.io'],
            proxy: {
                '/localhost': 'http://localhost',
                '.*': 'http://www.github.com'
            }
        }
    ],
    "anyproxy": {
        "port": 8001,
        "webInterface": {
            "webPort": 8002,
            "wsPort": 8003
        },
        "forceProxyHttps": true,
        "silent": true
    }
}