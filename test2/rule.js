module.exports = {
    "plugins": [
       {
           name: 'proxy',
           include: ['/proxy'],
           proxy: {
               '/2http$': 'http://localhost:8002',
               '/2https$': 'https://www.baidu.com'
           }
       },
        {
            name: 'mock',
            include: ['/mock'],
            mock: {
                '/list': {
                    'list|10-20': {
                        'id|+1': 0,
                        'text': 'text' 
                    }
                }
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