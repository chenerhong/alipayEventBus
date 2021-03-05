# alipayEventBus
* 支持匿名函数
* 页面卸载时订阅事件自动销毁
  
## 调用方式

``` javascript
// app.js
const broadcast = require('./libs/broadcast')
App({
    broadcast
})
```
``` javascript
// pages/index/index
app.broadcast.on('cityChange', () => {
    // 回调
})
```