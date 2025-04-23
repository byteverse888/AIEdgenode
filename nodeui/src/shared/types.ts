import { GeminiModel } from '@/packages/models/gemini'
import { LanguageModelUsage } from 'ai'
import pick from 'lodash/pick'
import { v4 as uuidv4 } from 'uuid'
import { OpenAIModel } from '../renderer/packages/models/openai'

export interface MessageFile {
  id: string
  name: string
  fileType: string
  url?: string
  storageKey?: string
  chatboxAIFileUUID?: string
}

export interface MessageLink {
  id: string
  url: string
  title: string
  storageKey?: string
  chatboxAILinkUUID?: string
}

export interface MessagePicture {
  url?: string
  storageKey?: string
  loading?: boolean
}

export interface MessageWebBrowsing {
  chatboxAIWebBrowsingUUID?: string
  query: string[]
  links: {
    title: string
    url: string
  }[]
}

export type MessageToolCalls = { [key: string]: MessageToolCall }

export type MessageToolCall = {
  id: string
  function: {
    name: string
    arguments: string
  }
}

export const MessageRoleEnum = {
  System: 'system',
  User: 'user',
  Assistant: 'assistant',
  Tool: 'tool',
} as const

export type MessageRole = (typeof MessageRoleEnum)[keyof typeof MessageRoleEnum]

export type MessageTextPart = { type: 'text'; text: string }
export type MessageImagePart = { type: 'image'; storageKey: string }
export type MessageToolCallPart = { type: 'tool-call'; toolCallId: string; toolName: string; args: unknown }
export type MessageContentParts = (MessageTextPart | MessageImagePart | MessageToolCallPart)[]
export type StreamTextResult = {
  contentParts: MessageContentParts
  reasoningContent?: string
  usage?: LanguageModelUsage
}
// Chatbox 应用的消息类型
export interface Message {
  id: string // 当role为tool时，id为toolCallId

  role: MessageRole
  // 把这个字段注释是为了避免新的引用，兼容老数据的时候还是可以读取
  // content?: string // contentParts 有值的时候用contentParts
  name?: string // 之前不知道是干什么的，现在用于role=tool时存储tool name

  cancel?: () => void
  generating?: boolean

  aiProvider?: ModelProvider
  model?: string

  style?: string // image style
  // pictures?: MessagePicture[] // 迁移到 contentParts 中

  files?: MessageFile[] // chatboxai 专用
  links?: MessageLink[] // chatboxai 专用
  webBrowsing?: MessageWebBrowsing // chatboxai 专用

  reasoningContent?: string
  toolCalls?: MessageToolCalls
  contentParts: MessageContentParts

  errorCode?: number
  error?: string
  errorExtra?: {
    [key: string]: any
  }
  status?: (
    | {
        type: 'sending_file'
        mode?: 'local' | 'advanced'
      }
    | {
        type: 'loading_webpage'
        mode?: 'local' | 'advanced'
      }
    | {
        type: 'web_browsing'
      }
  )[]

  wordCount?: number // 当前消息的字数
  tokenCount?: number // 当前消息的 token 数量
  tokensUsed?: number // 生成当前消息的 token 使用量
  timestamp?: number // 当前消息的时间戳
  firstTokenLatency?: number // AI 回答首字耗时(毫秒) - 从发送请求到接收到第一个字的时间间隔
}

export type SettingWindowTab = 'ai' | 'display' | 'chat' | 'advanced' | 'extension'

export type ExportChatScope = 'all_threads' | 'current_thread'

export type ExportChatFormat = 'Markdown' | 'TXT' | 'HTML'

export type SessionType = 'chat' | 'picture'

export function isChatSession(session: Session) {
  return session.type === 'chat' || !session.type
}
export function isPictureSession(session: Session) {
  return session.type === 'picture'
}

export interface Session {
  id: string
  type?: SessionType // undefined 为了兼容老版本 chat
  name: string
  picUrl?: string
  messages: Message[]
  starred?: boolean
  copilotId?: string
  assistantAvatarKey?: string // 助手头像的 key
  settings?: Partial<ReturnType<typeof settings2SessionSettings>>
  threads?: SessionThread[] // 历史话题列表
  threadName?: string // 当前话题名称
  messageForksHash?: Record<
    string,
    {
      position: number // 当前分叉列表的游标
      lists: {
        id: string // fork list id
        messages: Message[]
      }[]
      createdAt: number
    }
  > // 消息 ID 对应的分叉数据
}

// 话题
export interface SessionThread {
  id: string
  name: string
  messages: Message[]
  createdAt: number
}

export interface SessionThreadBrief {
  id: string
  name: string
  createdAt?: number
  createdAtLabel?: string
  firstMessageId: string
  messageCount: number
}

export function settings2SessionSettings(settings: ModelSettings) {
  return pick(settings, [
    'aiProvider',

    'chatboxAIModel',
    'openaiMaxContextMessageCount',
    'maxContextMessageCount',
    'temperature',
    'topP',
    'dalleStyle',
    'imageGenerateNum',

    'model',
    'openaiCustomModel',
    // 'openaiMaxContextTokens',
    // 'openaiMaxTokens',

    'azureDeploymentName',
    'azureDalleDeploymentName',

    'chatglmModel',

    'claudeModel',

    'ollamaHost',
    'ollamaModel',

    'geminiModel',

    'groqModel',

    'deepseekModel',

    'siliconCloudModel',

    'lmStudioModel',

    'perplexityModel',

    'xAIModel',

    'selectedCustomProviderId',
    'customProviders',
  ])
}

export function pickPictureSettings(settings: ModelSettings) {
  return pick(settings, ['dalleStyle', 'imageGenerateNum'])
}

export function createMessage(role: MessageRole = MessageRoleEnum.User, content: string = ''): Message {
  return {
    id: uuidv4(),
    contentParts: content ? [{ type: 'text', text: content }] : [], // 防止为 undefined 或 null
    role: role,
    timestamp: new Date().getTime(),
  }
}

export enum ModelProvider {
  ChatboxAI = 'chatbox-ai',
  OpenAI = 'openai',
  Azure = 'azure',
  ChatGLM6B = 'chatglm-6b',
  Claude = 'claude',
  Gemini = 'gemini',
  Ollama = 'ollama',
  Groq = 'groq',
  DeepSeek = 'deepseek',
  SiliconFlow = 'siliconflow',
  LMStudio = 'lm-studio',
  Perplexity = 'perplexity',
  XAI = 'xAI',
  Custom = 'custom',
}

export interface ModelSettings {
  aiProvider: ModelProvider // 当前应用中使用的provider（虽然可以配很多，但实际同时只能使用一个）

  // openai
  openaiKey: string
  apiHost: string
  model: OpenAIModel | 'custom-model'
  openaiCustomModel?: string // OpenAI 自定义模型的 ID
  openaiCustomModelOptions: string[]
  openaiUseProxy: boolean

  dalleStyle: 'vivid' | 'natural'
  imageGenerateNum: number // 生成图片的数量

  // azure
  azureEndpoint: string
  azureDeploymentName: string
  azureDeploymentNameOptions: string[]
  azureDalleDeploymentName: string // dall-e-3 的部署名称
  azureApikey: string
  azureApiVersion: string

  // chatglm
  chatglm6bUrl: string // deprecated
  chatglmApiKey: string
  chatglmModel: string

  // chatbox-ai
  licenseKey?: string
  chatboxAIModel?: ChatboxAIModel
  licenseInstances?: {
    [key: string]: string
  }
  licenseDetail?: ChatboxAILicenseDetail

  // claude
  claudeApiKey: string
  claudeApiHost: string
  claudeModel: string

  // google gemini
  geminiAPIKey: string
  geminiAPIHost: string
  geminiModel: GeminiModel

  // ollama
  ollamaHost: string
  ollamaModel: string

  // groq
  groqAPIKey: string
  groqModel: string

  // deepseek
  deepseekAPIKey: string
  deepseekModel: string

  // siliconflow
  siliconCloudKey: string
  siliconCloudModel: string

  // LMStudio
  lmStudioHost: string
  lmStudioModel: string

  // perplexity
  perplexityApiKey: string
  perplexityModel: string

  // xai
  xAIKey: string
  xAIModel: string

  // custom provider
  selectedCustomProviderId?: string // 选中的自定义提供者 ID，仅当 aiProvider 为 custom 时有效
  customProviders: CustomProvider[]

  temperature: number // 0-2
  topP: number // 0-1
  // openaiMaxTokens: number // 生成消息的最大限制，是传入 OpenAI 接口的参数。0 代表不限制（不传递）
  // openaiMaxContextTokens: number // 聊天消息上下文的tokens限制。
  openaiMaxContextMessageCount: number // 聊天消息上下文的消息数量限制。超过20表示不限制
  maxContextMessageCount?: number
  // maxContextSize: string 弃用，字段名永远不在使用，避免老版本报错
  // maxTokens: string 弃用，字段名永远不在使用，避免老版本报错
}

export type ModelMeta = {
  [key: string]: {
    contextWindow: number
    maxOutput?: number
    functionCalling?: boolean
    vision?: boolean
    reasoning?: boolean
  }
}

export interface CustomProvider {
  id: string
  name: string
  api: 'openai'
  host: string
  path: string
  key: string
  model: string
  modelOptions?: string[]
  useProxy?: boolean
}

export interface ExtensionSettings {
  webSearch: {
    provider: 'build-in' | 'bing' | 'tavily' // 搜索提供方
    tavilyApiKey?: string // Tavily API 密钥
  }
}

export interface Settings extends ModelSettings {
  showWordCount?: boolean
  showTokenCount?: boolean
  showTokenUsed?: boolean
  showModelName?: boolean
  showMessageTimestamp?: boolean
  showFirstTokenLatency?: boolean

  theme: Theme
  language: Language
  languageInited?: boolean
  fontSize: number
  spellCheck: boolean

  // disableQuickToggleShortcut?: boolean // 是否关闭快捷键切换窗口显隐（弃用，为了兼容历史数据，这个字段永远不要使用）

  defaultPrompt?: string // 新会话的默认 prompt

  proxy?: string // 代理地址

  allowReportingAndTracking: boolean // 是否允许错误报告和事件追踪

  userAvatarKey?: string // 用户头像的 key
  defaultAssistantAvatarKey?: string // 默认助手头像的 key

  enableMarkdownRendering: boolean
  enableMermaidRendering: boolean
  enableLaTeXRendering: boolean
  injectDefaultMetadata: boolean // 是否注入默认附加元数据（如模型名称、当前日期）
  autoPreviewArtifacts: boolean // 是否自动展开预览 artifacts
  autoCollapseCodeBlock: boolean // 是否自动折叠代码块
  pasteLongTextAsAFile: boolean // 是否将长文本粘贴为文件

  autoGenerateTitle: boolean

  autoLaunch: boolean
  autoUpdate: boolean // 是否自动检查更新
  betaUpdate: boolean // 是否自动检查 beta 更新
  shortcuts: ShortcutSetting

  extension: ExtensionSettings
}

export interface ShortcutSetting {
  // windowQuickToggle: string // 快速切换窗口显隐的快捷键
  quickToggle: ShortcutToggleWindowValue

  inputBoxFocus: string // 聚焦输入框的快捷键
  inputBoxWebBrowsingMode: string // 切换输入框的 web 浏览模式的快捷键
  newChat: string // 新建聊天的快捷键
  newPictureChat: string // 新建图片会话的快捷键
  sessionListNavNext: string // 切换到下一个会话的快捷键
  sessionListNavPrev: string // 切换到上一个会话的快捷键
  sessionListNavTargetIndex: string // 切换到指定会话的快捷键
  messageListRefreshContext: string // 刷新上下文的快捷键
  dialogOpenSearch: string // 打开搜索对话框的快捷键
  // inputBoxSend: string // 发送消息的快捷键
  // inputBoxInsertNewLine: string // 输入框换行的快捷键
  // inputBoxSendWithoutResponse: string // 发送但不生成回复的快捷键
  optionNavUp: string // 选项导航的快捷键
  optionNavDown: string // 选项导航的快捷键
  optionSelect: string // 选项导航的快捷键
  inpubBoxSendMessage: ShortcutSendValue
  inpubBoxSendMessageWithoutResponse: ShortcutSendValue
}

export const shortcutSendValues = ['', 'Enter', 'Ctrl+Enter', 'Command+Enter', 'Shift+Enter', 'Ctrl+Shift+Enter']
export type ShortcutSendValue = (typeof shortcutSendValues)[number]
export const shortcutToggleWindowValues = [
  '',
  'Alt+`',
  'Alt+Space',
  'Ctrl+Alt+Space',
  // 'Command+Space', // 系统快捷键冲突
  'Ctrl+Space', // 系统快捷键冲突
  // 'Command+Alt+Space', 系统快捷键冲突
]
export type ShortcutToggleWindowValue = (typeof shortcutToggleWindowValues)[number]

export type ShortcutName = keyof ShortcutSetting

export type Language =
  | 'en'
  | 'zh-Hans'
  | 'zh-Hant'
  | 'ja'
  | 'ko'
  | 'ru'
  | 'de'
  | 'fr'
  | 'pt-PT'
  | 'es'
  | 'ar'
  | 'it-IT'
  | 'sv'
  | 'nb-NO'

export interface Config {
  uuid: string
}

export interface SponsorAd {
  text: string
  url: string
}

export interface SponsorAboutBanner {
  type: 'picture' | 'picture-text'
  name: string
  pictureUrl: string
  link: string
  title: string
  description: string
}

export interface CopilotDetail {
  id: string
  name: string
  picUrl?: string
  prompt: string
  demoQuestion?: string
  demoAnswer?: string
  starred?: boolean
  usedCount: number
  shared?: boolean
}

export interface Toast {
  id: string
  content: string
}

export enum Theme {
  Dark,
  Light,
  System,
}

export interface RemoteConfig {
  setting_chatboxai_first: boolean
  product_ids: number[]
}

export interface ChatboxAILicenseDetail {
  type: ChatboxAIModel // 弃用，存在于老版本中
  name: string
  defaultModel: ChatboxAIModel
  remaining_quota_35: number
  remaining_quota_4: number
  remaining_quota_image: number
  image_used_count: number
  image_total_quota: number
  token_refreshed_time: string
  token_expire_time: string | null | undefined
}

export type ChatboxAIModel = 'chatboxai-3.5' | 'chatboxai-4' | string

export interface ModelOptionGroup {
  group_name?: string
  options: {
    label: string
    value: string
    recommended?: boolean
  }[]
  // hidden?: boolean
  collapsable?: boolean
}

export function copyMessage(source: Message): Message {
  return {
    ...source,
    cancel: undefined,
    id: uuidv4(),
  }
}

export function copyThreads(source?: SessionThread[]): SessionThread[] | undefined {
  if (!source) {
    return undefined
  }
  return source.map((thread) => ({
    ...thread,
    messages: thread.messages.map(copyMessage),
    createdAt: Date.now(),
    id: uuidv4(),
  }))
}
