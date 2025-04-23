import { getDefaultStore } from 'jotai'
import { useEffect } from 'react'
import { settingsAtom } from '../stores/atoms'
import platform from '../platform'

export function useSystemLanguageWhenInit() {
  useEffect(() => {
    // 通过定时器延迟启动，防止处理状态底层存储的异步加载前错误的初始数据
    setTimeout(() => {
      ;(async () => {
        const store = getDefaultStore()
        const settings = store.get(settingsAtom)
        if (!settings.languageInited) {
          let locale = await platform.getLocale()

          // 网页版暂时不自动更改简体中文，防止网址封禁
          if (platform.type === 'web') {
            if (locale === 'zh-Hans') {
              locale = 'en'
            }
          }

          settings.language = locale
        }
        settings.languageInited = true
        store.set(settingsAtom, { ...settings })
      })()
    }, 2000)
  }, [])
}
