import { getDefaultStore } from 'jotai'
import { settingsAtom, sessionsAtom } from './atoms'
import * as defaults from '../../shared/defaults'
import {
  mermaidSessionCN,
  mermaidSessionEN,
  artifactSessionCN,
  artifactSessionEN,
  imageCreatorSessionForCN,
  imageCreatorSessionForEN,
} from '@/packages/initial_data'
import platform from '@/platform'
import WebPlatform from '@/platform/web_platform'
import storage, { StorageKey } from '@/storage'
import oldStore from 'store'

export function migrate() {
  // 通过定时器延迟启动，防止处理状态底层存储的异步加载前错误的初始数据（水合阶段）
  setTimeout(_migrate, 2000)
}

async function _migrate() {
  let configVersion = await storage.getItem(StorageKey.ConfigVersion, 0)
  if (configVersion < 1) {
    await migrate_0_to_1()
    configVersion = 1
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
  }
  if (configVersion < 2) {
    await migrate_1_to_2()
    configVersion = 2
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
  }
  if (configVersion < 3) {
    await migrate_2_to_3()
    configVersion = 3
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
  }
  if (configVersion < 4) {
    await migrate_3_to_4()
    configVersion = 4
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
  }
  if (configVersion < 5) {
    const needRelaunch = await migrate_4_to_5()
    configVersion = 5
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
    if (needRelaunch) {
      await platform.relaunch()
    }
  }
  if (configVersion < 6) {
    await migrate_5_to_6()
    configVersion = 6
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
  }
  if (configVersion < 7) {
    const needRelaunch = await migrate_6_to_7()
    configVersion = 7
    await storage.setItemNow(StorageKey.ConfigVersion, configVersion)
    if (needRelaunch) {
      await platform.relaunch()
    }
  }
}

async function migrate_0_to_1() {
  const settings = await storage.getItem(StorageKey.Settings, defaults.settings())
  // 如果历史版本的用户开启了消息的token计数展示，那么也帮他们开启token消耗展示
  if (settings.showTokenCount) {
    getDefaultStore().set(settingsAtom, (settings) => ({ ...settings, showTokenUsed: true }))
  }
}

async function migrate_1_to_2() {
  const sessions = await storage.getItem(StorageKey.ChatSessions, defaults.sessions())
  const lang = await platform.getLocale()
  if (lang.startsWith('zh')) {
    if (sessions.find((session) => session.id === imageCreatorSessionForCN.id)) {
      return
    }
    getDefaultStore().set(sessionsAtom, (sessions) => [...sessions, imageCreatorSessionForCN])
  } else {
    if (sessions.find((session) => session.id === imageCreatorSessionForEN.id)) {
      return
    }
    getDefaultStore().set(sessionsAtom, (sessions) => [...sessions, imageCreatorSessionForEN])
  }
}

async function migrate_2_to_3() {
  // 原来 Electron 应用存储图片 base64 数据到 IndexedDB，现在改成本地文件存储
  if (platform.type !== 'desktop') {
    return
  }
  const ws = new WebPlatform()
  const blobKeys = await ws.listStoreBlobKeys()
  for (const key of blobKeys) {
    const value = await ws.getStoreBlob(key)
    if (!value) {
      continue
    }
    await storage.setBlob(key, value)
    await ws.delStoreBlob(key)
  }
}

async function migrate_3_to_4() {
  const sessions = await storage.getItem(StorageKey.ChatSessions, defaults.sessions())
  const lang = await platform.getLocale()
  const targetSession = lang.startsWith('zh') ? artifactSessionCN : artifactSessionEN
  if (sessions.find((session) => session.id === targetSession.id)) {
    return
  }
  getDefaultStore().set(sessionsAtom, (sessions) => [...sessions, targetSession])
}

async function migrate_4_to_5(): Promise<boolean> {
  if (platform.type !== 'web') {
    return false
  }
  // 针对网页版，从 store 迁移至 localforage
  // 本质上是从更小的 localStorage 迁移到更大的 IndexedDB，解决容量不够用的问题
  const keys: string[] = []
  oldStore.each((value, key) => {
    keys.push(key)
  })
  if (keys.length === 0) {
    return false
  }
  for (const key of keys) {
    await storage.setItemNow(key, oldStore.get(key))
  }
  return true
}

async function migrate_5_to_6() {
  const sessions = await storage.getItem(StorageKey.ChatSessions, defaults.sessions())
  const lang = await platform.getLocale()
  const targetSession = lang.startsWith('zh') ? mermaidSessionCN : mermaidSessionEN
  if (sessions.find((session) => session.id === targetSession.id)) {
    return
  }
  getDefaultStore().set(sessionsAtom, (sessions) => [...sessions, targetSession])
}

async function migrate_6_to_7(): Promise<boolean> {
  if (platform.type !== 'mobile') {
    return false
  }
  // 针对mobile端，从 store 迁移至 sqllite
  // 解决容量不够用的问题
  const keys: string[] = []
  oldStore.each((value, key) => {
    keys.push(key)
  })
  if (keys.length === 0) {
    return false
  }
  for (const key of keys) {
    await storage.setItemNow(key, oldStore.get(key))
  }
  return true
}
