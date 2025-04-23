import { RefObject } from 'react'
import { atom, SetStateAction } from 'jotai'
import {
  Session,
  Toast,
  Settings,
  CopilotDetail,
  MessagePicture,
  Message,
  SessionThreadBrief,
  SettingWindowTab,
} from '../../shared/types'
import { selectAtom, atomWithStorage } from 'jotai/utils'
import { focusAtom } from 'jotai-optics'
import * as defaults from '../../shared/defaults'
import storage, { StorageKey } from '../storage'
import { VirtuosoHandle } from 'react-virtuoso'
import platform from '../platform'
import { mergeSettings } from './sessionActions'
import { migrateMessage } from '../utils/message'
import { migrateSession } from '../utils/session-utils'
// settings

const _settingsAtom = atomWithStorage<Settings>(StorageKey.Settings, defaults.settings(), storage)
export const settingsAtom = atom(
  (get) => {
    const _settings = get(_settingsAtom)
    // 兼容早期版本
    const settings = Object.assign({}, defaults.settings(), _settings)
    settings.shortcuts = Object.assign({}, defaults.settings().shortcuts, _settings.shortcuts)
    return settings
  },
  (get, set, update: SetStateAction<Settings>) => {
    const settings = get(_settingsAtom)
    let newSettings = typeof update === 'function' ? update(settings) : update
    // 考虑关键配置的缺省情况
    if (!newSettings.apiHost) {
      newSettings.apiHost = defaults.settings().apiHost
    }
    // 如果快捷键配置发生变化，需要重新注册快捷键
    if (newSettings.shortcuts !== settings.shortcuts) {
      platform.ensureShortcutConfig(newSettings.shortcuts)
    }
    // 如果代理配置发生变化，需要重新注册代理
    if (newSettings.proxy !== settings.proxy) {
      platform.ensureProxyConfig({ proxy: newSettings.proxy })
    }
    // 如果开机自启动配置发生变化，需要重新设置开机自启动
    if (Boolean(newSettings.autoLaunch) !== Boolean(settings.autoLaunch)) {
      platform.ensureAutoLaunch(newSettings.autoLaunch)
    }
    set(_settingsAtom, newSettings)
  }
)

export const languageAtom = focusAtom(settingsAtom, (optic) => optic.prop('language'))
export const showWordCountAtom = focusAtom(settingsAtom, (optic) => optic.prop('showWordCount'))
export const showTokenCountAtom = focusAtom(settingsAtom, (optic) => optic.prop('showTokenCount'))
export const showTokenUsedAtom = focusAtom(settingsAtom, (optic) => optic.prop('showTokenUsed'))
export const showModelNameAtom = focusAtom(settingsAtom, (optic) => optic.prop('showModelName'))
export const showMessageTimestampAtom = focusAtom(settingsAtom, (optic) => optic.prop('showMessageTimestamp'))
export const showFirstTokenLatencyAtom = focusAtom(settingsAtom, (optic) => optic.prop('showFirstTokenLatency'))
export const userAvatarKeyAtom = focusAtom(settingsAtom, (optic) => optic.prop('userAvatarKey'))
export const defaultAssistantAvatarKeyAtom = focusAtom(settingsAtom, (optic) => optic.prop('defaultAssistantAvatarKey'))
export const themeAtom = focusAtom(settingsAtom, (optic) => optic.prop('theme'))
export const fontSizeAtom = focusAtom(settingsAtom, (optic) => optic.prop('fontSize'))
export const spellCheckAtom = focusAtom(settingsAtom, (optic) => optic.prop('spellCheck'))
export const allowReportingAndTrackingAtom = focusAtom(settingsAtom, (optic) => optic.prop('allowReportingAndTracking'))
export const enableMarkdownRenderingAtom = focusAtom(settingsAtom, (optic) => optic.prop('enableMarkdownRendering'))
export const enableLaTeXRenderingAtom = focusAtom(settingsAtom, (optic) => optic.prop('enableLaTeXRendering'))
export const enableMermaidRenderingAtom = focusAtom(settingsAtom, (optic) => optic.prop('enableMermaidRendering'))
export const selectedCustomProviderIdAtom = focusAtom(settingsAtom, (optic) => optic.prop('selectedCustomProviderId'))
export const autoPreviewArtifactsAtom = focusAtom(settingsAtom, (optic) => optic.prop('autoPreviewArtifacts'))
export const autoGenerateTitleAtom = focusAtom(settingsAtom, (optic) => optic.prop('autoGenerateTitle'))
export const autoCollapseCodeBlockAtom = focusAtom(settingsAtom, (optic) => optic.prop('autoCollapseCodeBlock'))
export const shortcutsAtom = focusAtom(settingsAtom, (optic) => optic.prop('shortcuts'))
export const pasteLongTextAsAFileAtom = focusAtom(settingsAtom, (optic) => optic.prop('pasteLongTextAsAFile'))

export const licenseDetailAtom = focusAtom(settingsAtom, (optic) => optic.prop('licenseDetail'))

// myCopilots
export const myCopilotsAtom = atomWithStorage<CopilotDetail[]>(StorageKey.MyCopilots, [], storage)

// sessions

// _sessionsAtom 内部状态，不对外暴露
const _sessionsAtom = atomWithStorage<Session[]>(StorageKey.ChatSessions, [], storage)
// sessionsAtom 会话列表，保证至少有一个会话
export const sessionsAtom = atom(
  (get) => {
    let sessions = get(_sessionsAtom)
    if (sessions.length === 0) {
      sessions = defaults.sessions()
    }
    return sessions
  },
  (get, set, update: SetStateAction<Session[]>) => {
    const sessions = get(_sessionsAtom)
    let newSessions = typeof update === 'function' ? update(sessions) : update
    if (newSessions.length === 0) {
      newSessions = defaults.sessions()
    }
    set(_sessionsAtom, newSessions)
  }
)
export const sortedSessionsAtom = atom((get) => {
  return sortSessions(get(sessionsAtom))
})

export function sortSessions(sessions: Session[]): Session[] {
  let reversed: Session[] = []
  let pinned: Session[] = []
  for (const sess of sessions) {
    if (sess.starred) {
      pinned.push(sess)
      continue
    }
    reversed.unshift(sess)
  }
  return pinned.concat(reversed)
}

// current session and messages

// 缓存在 localStorage，不对外暴露，属于内部状态
const _currentSessionIdCachedAtom = atomWithStorage<string | null>('_currentSessionIdCachedAtom', null)
export const currentSessionIdAtom = atom(
  (get) => {
    const idCached = get(_currentSessionIdCachedAtom)
    const sessions = get(sortedSessionsAtom)
    if (idCached && sessions.some((session) => session.id === idCached)) {
      return idCached
    }
    return sessions[0].id // 当前会话不存在时，返回列表中第一个会话
  },
  (_get, set, update: string) => {
    set(_currentSessionIdCachedAtom, update)
  }
)

export const currentSessionAtom = atom((get) => {
  const id = get(currentSessionIdAtom)
  const sessions = get(sessionsAtom)
  let current = sessions.find((session) => session.id === id)
  if (!current) {
    current = sessions[sessions.length - 1] // 当前会话不存在时，返回最后一个会话
  }
  return migrateSession(current)
})

export const currentSessionNameAtom = selectAtom(currentSessionAtom, (s) => s.name)
export const currsentSessionPicUrlAtom = selectAtom(currentSessionAtom, (s) => s.picUrl)
export const currentSessionAssistantAvatarKeyAtom = selectAtom(currentSessionAtom, (s) => s.assistantAvatarKey)

// 当前消息列表（包含历史主题下的消息）

export const currentMessageListAtom = selectAtom(currentSessionAtom, (s) => {
  let messageContext: Message[] = []
  if (s.threads) {
    for (const thread of s.threads) {
      messageContext = messageContext.concat(thread.messages)
    }
  }
  // const lastThreadMessageIndex = messageContext.length - 1
  if (s.messages) {
    messageContext = messageContext.concat(s.messages)
  }
  return messageContext.map(migrateMessage)
})

export const currentThreadHistoryHashAtom = selectAtom(currentSessionAtom, (s) => {
  const ret: { [firstMessageId: string]: SessionThreadBrief } = {}
  if (s.threads) {
    for (const thread of s.threads) {
      if (!thread.messages || thread.messages.length === 0) {
        continue
      }
      ret[thread.messages[0].id] = {
        id: thread.id,
        name: thread.name,
        createdAt: thread.createdAt,
        createdAtLabel: new Date(thread.createdAt).toLocaleString(),
        firstMessageId: thread.messages[0].id,
        messageCount: thread.messages.length,
      }
    }
    if (s.messages && s.messages.length > 0) {
      ret[s.messages[0].id] = {
        id: s.id,
        name: s.threadName || '',
        firstMessageId: s.messages[0].id,
        messageCount: s.messages.length,
      }
    }
  }
  return ret
})

export const currentSessionSettingsAtom = selectAtom(currentSessionAtom, (session) => session.settings)
export const currentSessionTypeAtom = selectAtom(currentSessionAtom, (session) => session.type || 'chat') // 老版本 chat 可能是 undefined

export const currentMergedSettingsAtom = atom((get) => {
  const sessionSettings = get(currentSessionSettingsAtom)
  const globalSettings = get(settingsAtom)
  if (!sessionSettings) {
    return globalSettings
  }
  const sessionType = get(currentSessionTypeAtom)
  return mergeSettings(globalSettings, sessionSettings, sessionType)
})

// toasts

export const toastsAtom = atom<Toast[]>([])

// quote 消息引用

export const quoteAtom = atom<string>('')

// theme

export const realThemeAtom = atom<'light' | 'dark'>('light')

// configVersion 配置版本，用于判断是否需要升级迁移配置（migration）
// export const configVersionAtom = atomWithStorage<number>(StorageKey.ConfigVersion, 0, storage)

// 远程配置
export const remoteConfigAtom = atomWithStorage<{ setting_chatboxai_first?: boolean }>(
  StorageKey.RemoteConfig,
  {},
  storage
)

// message scrolling

export const messageListElementAtom = atom<null | RefObject<HTMLDivElement>>(null)
export const messageScrollingAtom = atom<null | RefObject<VirtuosoHandle>>(null)
export const messageScrollingAtTopAtom = atom(false)
export const messageScrollingAtBottomAtom = atom(false)
export const messageScrollingScrollPositionAtom = atom<number>(0) // 当前视图高度位置（包含了视图的高度+视图距离顶部的偏移）

// 是否展示侧边栏
export const showSidebarAtom = atom(true)
// 显示会话历史主题的抽屉。值可以是历史的ID，用于打开抽屉时自动选择主题
export const showThreadHistoryDrawerAtom = atom<boolean | string>(false)

// 弹窗显示
export const openSearchDialogAtom = atom(false)
export const openSettingDialogAtom = atom<SettingWindowTab | null>(null)
export const sessionCleanDialogAtom = atom<Session | null>(null) // 清空会话的弹窗
export const openWelcomeDialogAtom = atom(false)
export const openAboutDialogAtom = atom(false) // 是否展示相关信息的窗口
export const openCopilotDialogAtom = atom(false) // 是否展示copilot窗口

export const inputBoxLinksAtom = atom<{ url: string }[]>([])
export const inputBoxWebBrowsingModeAtom = atom(false)

// 图片展示窗口的图片
export const pictureShowAtom = atom<{
  picture: MessagePicture
  extraButtons?: {
    onClick: () => void
    icon: React.ReactNode
  }[]
  onSave?: () => void
} | null>(null)

export const widthFullAtom = atomWithStorage<boolean>('widthFull', false)
