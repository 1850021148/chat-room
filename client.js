const net = require('net')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

const client = new net.Socket()

client.setEncoding = 'UTF-8'

client.connect(9000, '127.0.0.1', function() {
  (function a() {
    rl.question('请输入内容: ', function(answer) {
      if(answer === '请广播') {
        client.write('请广播')
      } else if(answer === 'quit') {
        rl.close()
        client.destroy()
      } else {
        client.write(answer)
      }
      a()
    })
  })()
})

client.addListener('data', function(data) {
  console.log('from server: ', data.toString())
})
