module.exports = {
    "plugins": [
        {
            name: 'mock',
            include: ['localhost'],
            exclude: [],
            delay: 1000,
            mock: {
                '/test': {
                    code: 200,
                    message: '1234'
                }
            }
        },
        {
            name: 'proxy',
            proxy: {
                'https://manhua.163.com/static/core_online_c121f6c87bcb3a2d8efaafd42bd04287.js': 'http://localhost/assets/dist/js/app.js',
                'https://a.com/(.*)': 'http://localhost/[$1]'
            }
        },
        {
            name: 'reqHeader',
            header: {
                abc: 'alalall'
            }
        },
        {
            name: 'resHeader',
            header: {
                'cache-control': 'no-cache',
                'expires': 'Thu, 26 Oct 2017 03:20:53 GMT',
                'pragma': '',
                'last-modified': ''
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