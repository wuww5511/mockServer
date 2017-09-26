# mockServer
一个HTTP代理服务器，能够根据配置修改通过此代理服务器的请求，为指定请求返回mock数据，修改请求头、响应头，也可实现请求转发、延迟响应的功能。

## 安装
```
npm install -g mock-proxy-server
```

## 使用

```
mock-proxy-server - c <配置文件路径>
```
如果未指定配置文件，程序会在当前目录中自动生成，路径为`/mock_server/rule.js`

本程序基于[anyproxy](http://anyproxy.io/)实现，更加详细的使用手册可以参考[anyproxy](http://anyproxy.io/)

## 配置

```
module.exports = {
    plugins: [
        {
            name: 'mock',
            mock: {
                '/test': {
                    code: 200,
                    message: '1234'
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
```
`plugins`声明代理服务器中使用的插件及其配置

`anyproxy`声明代理服务器配置，参加[anyproxy](http://anyproxy.io/cn.html#作为npm模块使用)

## plugins配置

### mock
```
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
}
```

### proxy
```
{
    name: 'proxy',
    include: ['localhost'],
    exclude: [],
    delay: 1000,
    proxy: {
        'https://a.com/a.js': 'http://localhost/b.js',
        'https://a.com/(.*)': 'http://localhost/[$1]'
    }
}
```
### resHeader
```
{
    name: 'resHeader',
    include: ['localhost'],
    exclude: [],
    header: {
        'Cache-Control': 'max-age=2592000',
        'Expires': 'Thu, 26 Oct 2017 03:20:53 GMT',
        'Pragma': '',
        'Last-Modified': ''
    }
}
```