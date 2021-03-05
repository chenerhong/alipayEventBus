// /* 小程序广播组件 */
class Emitter{
    constructor() {
      this.eventMap = new Map()
    }
    on(name, callback) {
      if(!this.eventMap.has(name)) {
        this.eventMap.set(name, [])
      }
      let callbackList = this.eventMap.get(name)
      callbackList.push(callback)
      // 返回关闭函数
      return () => this.off(name, callback)
    }
    once(name, callback) {
      // 劫持一层，callback执行后就自动注销
      const listener = (...args) => {
        this.off(name, listener)
        callback(...args)
      }
      this.on(name, listener)
      return () => this.off(name, listener)
    }
    fire(name, data) {
      const callbackList = this.eventMap.get(name)
      if(Array.isArray(callbackList)) {
        callbackList.forEach(cb => {
          typeof cb === 'function' && cb(data)
        })
      }
    }
    off(name, callback) {
      if(this.eventMap.has(name)) {
        let callbackList = this.eventMap.get(name).filter(item => item !== callback)
        this.eventMap.set(name, callbackList)
      }
    }
  }
  
  const $event = new Emitter()
  
  // 存储实例对应的卸载方法
  const currentPageMap = new Map()
  // 存储实例页面
  const markOnUnmounted = new Set()
  
  function markListenHandle(stopHandle) {
    let currentPage
    try{
      const routers = getCurrentPages() || []
      currentPage = Array.isArray(routers) && routers[routers.length - 1] || ''
    }catch(e) {
      console.log(e)
    }
    if(!currentPage) {
      return 
    }
    const list = currentPageMap.get(currentPage) || currentPageMap.set(currentPage, []).get(currentPage)
    list.push(stopHandle)
    if(!markOnUnmounted.has(currentPage)) {
      markOnUnmounted.add(currentPage)
      // 劫持页面上的onUnload方法
      const onUnload = currentPage.onUnload
      // 重写onUnload
      currentPage.onUnload = function() {
        onUnload.apply(this, arguments)
        // 清空当前页面所有的on
        const stopHandleList = currentPageMap.get(currentPage)
        stopHandleList.forEach(val => val())
        markOnUnmounted.delete(currentPage)
        currentPage = null
      }
    }
  }
  
  class Broadcast{
    on(name, callback) {
      const stopHandle = $event.on(name, callback)
      // 存储卸载方法到对应实例上
      markListenHandle(stopHandle)
      return stopHandle
    }
    fire(name, callback) {
      return $event.fire(name, callback)
    }
    off(name, callback) {
      return $event.off(name, callback)
    }
  }
  
  module.exports = new Broadcast()