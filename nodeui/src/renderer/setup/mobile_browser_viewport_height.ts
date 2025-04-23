import { CHATBOX_BUILD_TARGET, CHATBOX_BUILD_PLATFORM } from '../variables'

// 解决移动端浏览器地址栏占用问题
// https://css-tricks.com/the-trick-to-viewport-units-on-mobile/
function setViewportHeight() {
  if (CHATBOX_BUILD_TARGET === 'mobile_app' && CHATBOX_BUILD_PLATFORM === 'ios') {
    // iOS 16 版本中，键盘隐藏后即使重新设置了 style，但是屏幕高度没有变化，将导致下方出现空白
    return
  }
  let vh = window.innerHeight * 0.01
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
setViewportHeight()

// 监听屏幕旋转时，更新视口高度
window.addEventListener('resize', setViewportHeight)
window.addEventListener('orientationchange', setViewportHeight)
if (screen && screen.orientation) {
  screen.orientation.addEventListener('change', setViewportHeight)
} else {
  // 兼容 iOS 16 及更低版本
  const mql = window.matchMedia('(orientation: portrait)')
  if (mql) {
    mql.addListener(function (m) {
      setViewportHeight()
      // if (m.matches) {
      //     // 当前为竖屏模式
      // } else {
      //     // 当前为横屏模式
      // }
    })
    // // 用来检查当前的媒体查询状态
    // if (mql.matches) {
    //     // 当前为竖屏模式
    // } else {
    //     // 当前为横屏模式
    // }
  }
}
