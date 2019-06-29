var http = require('http')
var fs = require('fs')
var url = require('url')
var port = process.argv[2] || 8080

if (!port) {
  console.log('请指定端口号好不啦？\n node server.js 8888 这样不会吗？')
  process.exit(1)
}
const log = console.log.bind(console)
var server = http.createServer(function (request, response) {
  var parsedUrl = url.parse(request.url, true)
  var pathWithQuery = request.url
  var queryString = ''
  if (pathWithQuery.indexOf('?') >= 0) {
    queryString = pathWithQuery.substring(pathWithQuery.indexOf('?'))
  }
  var path = parsedUrl.pathname
  var query = parsedUrl.query
  var method = request.method

  log('path = ' + path, 'method = ' + method.toUpperCase())
  log('含查询字符串的路径\n' + pathWithQuery)
  if (path === '/') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    let htmlContent = fs.readFileSync('./index.html', {
      encoding: 'utf-8'
    })
    let amount = fs.readFileSync('./db/account', {
      encoding: 'utf-8'
    })
    htmlContent = htmlContent.replace('{{amount}}', amount)

    response.write(htmlContent)
    response.end()
  } else if (path === '/main.js') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    response.write('console.log("I am from JS")');
    response.end()
  } else if (path === '/ajax.js') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/javascript;charset=utf-8')
    response.write(fs.readFileSync('./ajax.js', "utf8"));
    response.end()
  } else if (path === '/style.css') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/css;charset=utf-8')
    response.write('body{background-color: lightblue;}h1{color: red;}');
    response.end()
  } else if (path === '/pay') {
    console.log('query', query)
    console.log('method', method)
    let callbackName = query.callback
    response.setHeader('Content-Type', 'application/json;charset=utf-8')
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:8088')
    if (Math.random() > 0.5) {
      let amount = fs.readFileSync('./db/account', {
        encoding: 'utf-8'
      })
      amount = amount - 1
      fs.writeFileSync('./db/account', amount - 1)
      response.statusCode = 200
      response.write(`${callbackName}.call(undefined, {"success": true, "remain": ${amount}})`)
    } else {
      response.statusCode = 500
    }
    response.end()
  } else if (path === '/xxx') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/json;charset=utf-8')
    response.write(`{"success": true, "message": "this is test message from server"}`)
    response.end()
  } else if (path === '/signup' && method.toUpperCase() === 'GET') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    let html = fs.readFileSync('./signup.html', {
      encoding: 'utf-8'
    })
    response.write(html)
    response.end()
  } else if (path === '/signup' && method.toUpperCase() === 'POST') {
    // 获取 formdata
    readBody(request).then((r) => {
      log('接收的表单数据', r)
      let formdata = r.split('&')
      let hash = {}
      formdata.forEach(element => {
        let arr = element.split('=')
        hash[arr[0]] = decodeURIComponent(arr[1])
      });
      log('form convert to obj', hash)
      let {
        email,
        password
      } = hash
      //TODO 验证email是否存在, 验证失败返回400

      // 保存到文件
      fs.writeFileSync('./db/user', JSON.stringify(hash))

      response.statusCode = 200
      response.setHeader('Content-Type', 'application/json;charset=utf-8')
      response.write(`{"code": 200, "message": "ok"}`)
      response.end()

    }, (error) => {
      log('接收的表单数据出错了', error)
      response.statusCode = 400
      response.end()
    })

  } else if (path === '/signin' && method.toUpperCase() === 'GET') {
    response.statusCode = 200
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    let html = fs.readFileSync('./signin.html', {
      encoding: 'utf-8'
    })
    response.write(html)
    response.end()
  } else if (path === '/signin' && method.toUpperCase() === 'POST') {
    // 获取 formdata email=1111&password=111&password2=111
    readBody(request).then((r) => {
      let formdata = r.split('&')
      let hash = {}
      formdata.forEach(element => {
        let arr = element.split('=')
        hash[arr[0]] = decodeURIComponent(arr[1])
      });
      let {
        email,
        password
      } = hash

      let userdb = fs.readFileSync('./db/user', {
        encoding: 'utf-8'
      })
      let user = JSON.parse(userdb) || null

      response.setHeader('Content-Type', 'application/json;charset=utf-8')

      if (user && user.email === email && user.password === password) {
        response.statusCode = 200
        response.setHeader('Set-Cookie', `email=${email}; Path=/; Domain=localhost`)
        response.write(`{"code": 200, "message": "ok"}`)
      } else {
        response.statusCode = 401
        response.write(`{"code": 401, "message": "用户名或密码错误"}`)
      }
      response.end()
    }, (error) => {
      response.statusCode = 400
      response.write('400')
      response.end()
    })

  } else {
    response.statusCode = 404
    response.setHeader('Content-Type', 'text/html;charset=utf-8')
    response.write('404')
    response.end()
  }

  /******** 代码结束，下面不要看 ************/
})

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = []
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      resolve(body)
    })
  })
}

server.listen(port)
console.log('监听 ' + port + ' 成功\n请用在空中转体720度然后用浏览器打开 http://localhost:' + port)