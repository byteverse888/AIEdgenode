import storage from '../storage'
import { getDefaultStore } from 'jotai'
import * as atoms from '../stores/atoms'
import platform from '../platform'
import { Message } from 'src/shared/types'

// 启动时执行消息图片清理
// 只有网页版本需要清理，桌面版本存在本地、空间足够大无需清理
// 同时也避免了桌面端疑似出现的“图片丢失”问题（可能不是bug，与开发环境有关？）
if (platform.type !== 'desktop') {
  setTimeout(() => {
    tickStorageTask()
  }, 10 * 1000) // 防止水合状态
}

export async function tickStorageTask() {
  const allBlobKeys = await storage.getBlobKeys()
  const storageKeys = [
    ...allBlobKeys.filter((key) => key.startsWith('picture:')),
    ...allBlobKeys.filter((key) => key.startsWith('file:')),
  ]
  if (storageKeys.length === 0) {
    return
  }
  const needDeletedSet = new Set<string>(storageKeys)

  const store = getDefaultStore()

  // 会话中还存在的图片、文件不需要删除
  const sessions = store.get(atoms.sessionsAtom)
  for (const session of sessions) {
    for (const msg of session.messages) {
      for (const pic of (msg as Message & { pictures: { storageKey: string }[] }).pictures || []) {
        if (pic.storageKey) {
          needDeletedSet.delete(pic.storageKey)
        }
      }
      for (const file of msg.files || []) {
        if (file.storageKey) {
          needDeletedSet.delete(file.storageKey)
        }
      }
      for (const part of msg.contentParts || []) {
        if (part.type === 'image' && part.storageKey) {
          needDeletedSet.delete(part.storageKey)
        }
      }
      if (needDeletedSet.size === 0) {
        return
      }
    }

    // 会话助手头像不需要删除
    if (session.assistantAvatarKey) {
      needDeletedSet.delete(session.assistantAvatarKey)
    }
  }

  // 用户头像不需要删除
  const settings = store.get(atoms.settingsAtom)
  if (settings.userAvatarKey) {
    needDeletedSet.delete(settings.userAvatarKey)
  }
  // 助手头像不需要删除
  if (settings.defaultAssistantAvatarKey) {
    needDeletedSet.delete(settings.defaultAssistantAvatarKey)
  }

  for (const key of needDeletedSet) {
    await storage.delBlob(key)
  }
}
