// config
const port = 9000

// express
const express = require('express')
const app = express()
app.use('/assets', express.static('./assets'))
app.get('/', (req, res) => {
  console.log('aaaa')
  res.sendFile(require('path').join(__dirname, './chat-room.html'))
})

// http服务
const http = require('http')
const server = http.createServer(app)
server.listen(port)

const {Server: WebSocket} = require('ws')
const fs = require('fs')

// const wss = new WebSocket({port, host: '0.0.0.0'})
const wss = new WebSocket({server})

const clientMap = new Map()
let id = 1000

// data(client):
// {
//   id: id,
//   client: ws,
//   info: {
//     name: null,
//     type: null, // 'welcome' or 'quit' or null
//     content: '',
//     time: null, // 前端发出消息的时间
//   },
//   connectTime: Date.now(), // 后端连接创建的时间
//   who: null, // 'self' or 'other'
//   onlineUsers: [ // 在线用户的信息
//     { id, name, connectTime },
//     { id, name, connectTime },
//   ],
// }

wss.on('connection', function(ws, req) {
  id++
  const currentId = id
  clientMap.set(id, {
    address: req.socket.remoteAddress,
    id: id,
    client: ws,
    info: null,
    connectTime: new Date().toLocaleString(),
    onlineUsers: [],
  })

  ws.on('close', function() { // 用户退出聊天室了
    let respData = clientMap.get(currentId)

    respData.info.type = 'quit'

    // 服务端打印日志
    const { id: _id, info, connectTime, address } = respData
    console.log('quit... ', JSON.stringify({_id, info, connectTime, address}))

    respData.onlineUsers = getOnlineUsers().filter(user => user.id !== currentId)

    // 广播有用户退出了，并重新传给用户一份在线用户列表
    for (const client of getClients()) {
      client.send(JSON.stringify(respData))
    }

    gc(currentId)
    syncData2local()
  })
  ws.on('message', function(str) { // str对应info
    // 如果不能解析数据
    try {
      const {name} = JSON.parse(str)
    } catch (error) {
      console.log('有人发了个无效的数据过来，可能是项目bug，也可能是有懂得前端的在恶意乱搞')
      return
    }

    let respData = clientMap.get(currentId)
    // console.log(currentId)
    respData.info = JSON.parse(str)

    // 服务端打印日志
    console.log(JSON.stringify(respData, (key, value) => {
      if(key === 'client') return
      else return value
    }))

    // 如果是有人进入了聊天室，则要广播的数据要加一份在线用户列表
    if(respData.info.type === 'welcome') {
      // console.log('在线用户列表: ', getOnlineUsers())
      respData.onlineUsers = getOnlineUsers()
    }
    
    // 广播给所有人
    for (const client of getClients()) {
      if(client === ws) { // 如果广播到发送者
        respData.who = 'self'
      } else {
        respData.who = 'other'
      }
      client.send(JSON.stringify(respData, (key, value) => {
        if(key === 'client') return
        else return value
      }))
    }

    syncData2local()
  })
})

function gc(currentId) {
  // console.log('delete: ', currentId)
  clientMap.delete(currentId)
  console.log('当前用户数: ', clientMap.size)
}

function getClients() {
  return [...clientMap.values()].map(item => item.client)
}

function syncData2local() {
  fs.writeFileSync(
    './clients.json', 
    JSON.stringify([...clientMap.values()].map(({id,connectTime,info,address}) => ({id,connectTime,info,address})), null, 2)
  )
}

function getOnlineUsers() {
  return [...clientMap.values()].map(item => {
    return {
      id: item.id,
      name: item.info.name,
      connectTime: item.connectTime
    }
  })
}