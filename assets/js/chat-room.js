let myId;
let myConnectTime;
const host = location.host
// const host = '121.196.160.245'

const $ = str => document.querySelector(str)

const name = prompt('请输入用户名', '匿名') || '匿名'
$('input.name').value = name

var ws = new WebSocket(`ws://${host}`);

ws.onopen = function() {
  myConnectTime = Date.now()
  const info = {
    name: $('input.name').value || '匿名',
    type: 'welcome',
    time: myConnectTime
  }
  const str = JSON.stringify(info)
  ws.send(str);
};

ws.onmessage = function(event) {
  const data = JSON.parse(event.data)
  // console.log('data: ', data.info)

  if( ['welcome', 'quit'].includes(data.info.type) ) { // 如果有用户进入或退出了聊天室
    // <p class="welcome">
    //   <span class="name">juln</span>
    //   <span class="sys-info">系统编号104 下午9：09 进入了聊天室</span>
    // </p>

    if(data.info.type === 'welcome' && data.info.time === myConnectTime) {
      // 缓存自己的id
      myId = data.id
    }
    
    // 创建元素
    const p = document.createElement('p')
    const span_name = document.createElement('span')
    const span_sys_info = document.createElement('span')
    span_name.classList.add('name')
    span_sys_info.classList.add('sys-info')
    p.classList.add('welcome')
    
    // 装载数据
    span_name.textContent = data.info.name
    span_sys_info.textContent = `
      (系统编号: ${data.id}) \
      ${new Date(data.info.time).toLocaleString()} \
      ${data.info.type === 'welcome' ? '进入' : '退出'}了聊天室\
    `
    
    // 渲染
    p.append(span_name, span_sys_info)
    $('.info-box .inner').append(p)
    renderOnlineList(data.onlineUsers)
  }
  else {
    // <div class="right item">
    //   <span class="time">下午9：10</span>
    //   <span class="name">juln (系统编号 101)</span>
    //   <p class="content">nmsl</p>
    // </div>

    const div = document.createElement('div')
    div.classList.add('item')
    div.classList.add(data.who === 'self' ? 'right' : 'left')
    div.innerHTML = `
      <span class="time">${new Date(data.info.time).toLocaleString()}</span>
      <span class="name">${data.info.name} (系统编号 ${data.id})</span>
      <div class="content">${data.info.content}</div>
    `
    $('.info-box .inner').append(div)
  }

  // 滚动条自动滚动到最底下
  $('.info-box>.inner').scrollTo(0, $('.info-box>.inner').scrollHeight)
};

ws.onclose = function() {
  alert("与服务器的连接断开了");
};

function clickBtn() {
  if($('div[contenteditable]').innerHTML === '') return // 如果不输入内容则不理他
  const info = {
    name: $('input.name').value || '匿名',
    type: null,
    content: $('div[contenteditable]').innerHTML,
    time: Date.now()
  }
  const str = JSON.stringify(info)
  ws.send(str);
  // 清空输入框
  $('div[contenteditable]').innerHTML = ''
  // 重新获取输入框焦点
  $('div[contenteditable]').focus()
}

$('.send-btn').onclick = clickBtn
$('div[contenteditable]').onkeydown = function(event) {
  if(event.keyCode === 13 && event.ctrlKey) { // 回车
    clickBtn()
  }
}
window.onload = function() {
  $('div[contenteditable]').focus()
}

function renderOnlineList(data) {
  let _data = data.sort( (a,b) => (a.id === myId ? -1 : 1)) // 把自己挂在最前面，就是_data
  console.log('在线用户列表: ', _data)
  let innerHTML = `
    <div style="text-align: center;font-weight: bold;margin-bottom: 10px;">在线用户列表</div>
  `
  for (const user of _data) {
    innerHTML += `
      <li class="user ${user.id === myId ? 'self' : 'other'}">
        <a target="${user.id === myId ? '_self' : '_blank'}" href="${user.id === myId ? '#' : './alone-room.html?id='+user.id}">
          <div class="main-info">
            <span class="name">${user.name}</span>
            <span class="id">系统编号: ${user.id}</span>
          </div>
          <div class="other-info">
            <span class="time">登录时间: ${user.connectTime}</span>
          </div>
        </a>
      </li>
    `
  }
  innerHTML += `
    <span 
      style="color: gray;font-size: 12px;display: inline-block;width: 100%;text-align: center;">
    没有更多了...</span>
  `
  $('.side-bar ul').innerHTML = innerHTML
}