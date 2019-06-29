window.jQuery = window.jQuery || {}
window.jQuery.ajax = function ({
  url,
  method,
  body,
  headers
}) {
  // step1:
  // let url = options.url
  // let method = options.method
  // let body = options.body
  // let success = options.success
  // let fail = options.fail

  // step2 ES6 对象的解构赋值
  // let {url, method, body, success, fail} = options

  // step3 直接放在参数中

  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()
    xhr.open(method, url)

    for (const key in headers) {
      if (headers.hasOwnProperty(key)) {
        const value = headers[key];
        xhr.setRequestHeader(key, value)
      }
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          resolve(xhr.responseText)
        } else if (xhr.status >= 400) {
          reject(xhr)
        }
      }
    }
    xhr.send(body)
  })

}
// 调用示例
jQuery.ajax({
  url: '/xxx',
  method: 'get',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'fuck-brower': true
  }
}).then(
  (r) => {
    console.log(r)
  },
  (e) => {
    console.log(e)
  }
);