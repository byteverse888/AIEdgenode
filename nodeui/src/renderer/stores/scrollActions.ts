import { getDefaultStore } from 'jotai'
import * as atoms from './atoms'

// scrollToMessage 滚动到指定消息，如果消息不存在则返回 false
export function scrollToMessage(
  msgId: string,
  align: 'start' | 'center' | 'end' = 'start',
  behavior: 'auto' | 'smooth' = 'auto' // 'auto' 立即滚动到指定位置，'smooth' 平滑滚动到指定位置
): boolean {
  const store = getDefaultStore()
  const currentMessages = store.get(atoms.currentMessageListAtom)
  const index = currentMessages.findIndex((msg) => msg.id === msgId)
  if (index === -1) {
    return false
  }
  scrollToIndex(index, align, behavior)
  return true
}

export function scrollToIndex(
  index: number,
  align: 'start' | 'center' | 'end' = 'start',
  behavior: 'auto' | 'smooth' = 'auto' // 'auto' 立即滚动到指定位置，'smooth' 平滑滚动到指定位置
) {
  const store = getDefaultStore()
  const virtuoso = store.get(atoms.messageScrollingAtom)
  virtuoso?.current?.scrollToIndex({ index, align, behavior })
}

export function scrollToTop(behavior: 'auto' | 'smooth' = 'auto') {
  const store = getDefaultStore()
  const currentMessages = store.get(atoms.currentMessageListAtom)
  if (currentMessages.length === 0) {
    return
  }
  clearAutoScroll()
  return scrollToIndex(0, 'start', behavior)
}

export function scrollToBottom(behavior: 'auto' | 'smooth' = 'auto') {
  const store = getDefaultStore()
  const currentMessages = store.get(atoms.currentMessageListAtom)
  if (currentMessages.length === 0) {
    return
  }
  clearAutoScroll()
  return scrollToIndex(currentMessages.length - 1, 'end', behavior)
}

let autoScrollTask: {
  id: string
  task: {
    msgId: string
    align: 'start' | 'center' | 'end'
    behavior: 'auto' | 'smooth'
  }
} | null = null

export function startAutoScroll(
  msgId: string,
  align: 'start' | 'center' | 'end' = 'start',
  behavior: 'auto' | 'smooth' = 'auto' // 'auto' 立即滚动到指定位置，'smooth' 平滑滚动到指定位置
): string {
  const newTask = { msgId, align, behavior }
  const newId = JSON.stringify(newTask)
  if (autoScrollTask) {
    if (autoScrollTask.id === newId) {
      return autoScrollTask.id
    } else {
      clearAutoScroll()
    }
  }
  autoScrollTask = {
    id: newId,
    task: newTask,
  }
  return newId
}

export function tickAutoScroll(id: string) {
  if (!autoScrollTask || autoScrollTask.id !== id) {
    return
  }
  const { msgId, align, behavior } = autoScrollTask.task
  const succeed = scrollToMessage(msgId, align, behavior)
  if (!succeed) {
    clearAutoScroll()
  }
}

export function clearAutoScroll(id?: string) {
  if (!autoScrollTask) {
    return true
  }
  if (id && id !== autoScrollTask.id) {
    return false
  }
  autoScrollTask = null
  return true
}

export function getMessageListViewportHeight() {
  const store = getDefaultStore()
  const messageListElement = store.get(atoms.messageListElementAtom)
  if (!messageListElement) {
    return 0
  }
  return messageListElement.current?.clientHeight ?? 0
}
