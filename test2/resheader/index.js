const http = require('http')

let server = http.createServer((req, res) => {
    res.writeHead(200, {
        'cache-control': 'max-age=12312312'
    })

    res.end()
}).listen(3001)

http.request({
    host: '127.0.0.1',
    port: 8001,
    path: 'http://127.0.0.1:3001/'
}, res => {
    console.log(res.headers)
    server.close()
}).end()