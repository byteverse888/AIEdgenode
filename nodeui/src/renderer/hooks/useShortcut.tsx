import { useEffect } from 'react'
import platform from '../platform'
import * as dom from './dom'
import * as atoms from '../stores/atoms'
import * as sessionActions from '../stores/sessionActions'
import { getDefaultStore } from 'jotai'
import { useIsSmallScreen } from './useScreenChange'

export default function useShortcut() {
  const isSmallScreen = useIsSmallScreen()
  useEffect(() => {
    const cancel = platform.onWindowShow(() => {
      // 大屏幕下，窗口显示时自动聚焦输入框
      if (!isSmallScreen) {
        dom.focusMessageInput()
      }
    })
    window.addEventListener('keydown', keyboardShortcut)
    return () => {
      cancel()
      window.removeEventListener('keydown', keyboardShortcut)
    }
  }, [isSmallScreen])
}

function keyboardShortcut(e: KeyboardEvent) {
  // 这里不用 e.key 是因为 alt、 option、shift 都会改变 e.key 的值
  const ctrlOrCmd = e.ctrlKey || e.metaKey
  const shift = e.shiftKey
  const altOrOption = e.altKey

  if (e.code === 'KeyI' && ctrlOrCmd) {
    dom.focusMessageInput()
    return
  }
  if (e.code === 'KeyE' && ctrlOrCmd) {
    dom.focusMessageInput()
    const store = getDefaultStore()
    store.set(atoms.inputBoxWebBrowsingModeAtom, (v) => !v)
    return
  }

  // 创建新会话 CmdOrCtrl + N
  if (e.code === 'KeyN' && ctrlOrCmd && !shift) {
    sessionActions.createEmpty('chat')
    return
  }
  // 创建新图片会话 CmdOrCtrl + Shift + N
  if (e.code === 'KeyN' && ctrlOrCmd && shift) {
    sessionActions.createEmpty('picture')
    return
  }
  // 归档当前会话的上下文。
  // if (e.code === 'KeyR' && altOrOption) {
  //     e.preventDefault()
  //     sessionActions.startNewThread()
  //     return
  // }
  if (e.code === 'KeyR' && ctrlOrCmd) {
    e.preventDefault()
    sessionActions.startNewThread()
    return
  }

  if (e.code === 'Tab' && ctrlOrCmd && !shift) {
    sessionActions.switchToNext()
  }
  if (e.code === 'Tab' && ctrlOrCmd && shift) {
    sessionActions.switchToNext(true)
  }
  for (let i = 1; i <= 9; i++) {
    if (e.code === `Digit${i}` && ctrlOrCmd) {
      sessionActions.switchToIndex(i - 1)
    }
  }

  if (e.code === 'KeyK' && ctrlOrCmd) {
    const store = getDefaultStore()
    const openSearchDialog = store.get(atoms.openSearchDialogAtom)
    if (openSearchDialog) {
      store.set(atoms.openSearchDialogAtom, false)
    } else {
      store.set(atoms.openSearchDialogAtom, true)
    }
  }
}
