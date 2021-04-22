// 渲染初始页面

// 一共74个
const emojis_1 = '😀😁😂😃😄😅😆😉😊😋😎😍😘😗😙😚😇😐😑😶😏😣😥😮😯😪😫😴😌😛😜😝😒😓😔😕😲😷😖😞😟😤😢😭😦😧😨😬😰😱😳😵😡😠'
const emojis_2 = '💪👌👍👎👊👏💘💓💔💖🐁🐉🐍🐎🐐🐒🐓🐕🐖'
let fragment = document.createDocumentFragment()
for (const icon of emojis_1 + emojis_2) {
  let li = document.createElement('li')
  li.textContent = icon
  li.onclick = function() {
    $('div[contenteditable]').innerHTML += this.textContent
  }
  fragment.append(li)
}
$('.emoji-list').append(fragment)

// 点击事件
let click = function() {
  $('.emoji').classList.toggle('active')
}
$('.emoji').onclick = click
$('.emoji').ontouch = click