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
拦截指定请求，返回mock数据，如下面配置，为所有包含`localhost`, `/test`的请求，延迟1000ms后，返回json数据。
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
将指定请求代理到特定的服务器，如下面的配置，当请求`https://a.com/a.js`时，会返回`http://localhost/b.js`的数据；当请求`https://b.com/a.js`时，会返回`http://localhost/a.js`的数据。
```
{
    name: 'proxy',
    proxy: {
        'https://a.com/a.js': 'http://localhost/b.js',
        'https://b.com/(.*)': 'http://localhost/[$1]'
    }
}
```
### resHeader
对响应报头进行修改，如下面配置，为所有包含`localhost`的请求添加控制缓存的响应报头
```
{
    name: 'resHeader',
    include: ['localhost'],
    exclude: [],
    header: {
        'cache-control': 'max-age=2592000',
        'expires': 'Thu, 26 Oct 2017 03:20:53 GMT',
        'pragma': '',
        'last-modified': ''
    }
}
```

### 通用配置
`include`, `exclude` : 对经过代理服务器的请求进行筛选。
`delay`: 延迟一段时间后再返回数据

## 源码相关
### decorator
一个decorator的形式类似于:
```
/**
 *  @param {Object} opts 传递给plugin的参数
 *  @param {Object} last 上一个plugin返回的数据
 *  @return {Promise} resolve后，后续的decorator或plugin才会开始执行，如果reject, 后续的decorator和plugin都不会执行
 */
function (opts, last) {
    
}
```

### plugin
一个plugin的格式类似于：
```
/**
 *  @param {Object} opts 传递给plugin的参数
 *  @param {Object} last 上一个plugin返回的数据
 *  @param {Any} 可以返回任何类型，可以为Promise
 */
function (opts, last) {

}
```