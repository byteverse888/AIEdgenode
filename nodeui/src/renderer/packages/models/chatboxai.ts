import { parseJsonOrEmpty } from '@/lib/utils'
import storage from '@/storage'
import { apiRequest } from '@/utils/request'
import { handleSSE } from '@/utils/stream'
import { ChatboxAILicenseDetail, ChatboxAIModel, Message, MessageRole, StreamTextResult } from 'src/shared/types'
import * as remote from '../remote'
import Base, { CallChatCompletionOptions, ModelHelpers } from './base'
import { ApiError, BaseError, ChatboxAIAPIError, NetworkError } from './errors'
import { getMessageText } from '@/utils/message'
export const chatboxAIModels: ChatboxAIModel[] = ['chatboxai-3.5', 'chatboxai-4']

const helpers: ModelHelpers = {
  isModelSupportVision: (model: string) => {
    return true
  },
  isModelSupportToolUse: (model: string) => {
    return true
  },
}

interface Options {
  licenseKey?: string
  chatboxAIModel?: ChatboxAIModel
  licenseInstances?: {
    [key: string]: string
  }
  licenseDetail?: ChatboxAILicenseDetail
  language: string
  dalleStyle: 'vivid' | 'natural'
  temperature: number
}

interface Config {
  uuid: string
}

export default class ChatboxAI extends Base {
  public name = 'ChatboxAI'
  public static helpers = helpers

  constructor(public options: Options, public config: Config) {
    super()
  }

  isSupportToolUse() {
    return helpers.isModelSupportToolUse(this.options.chatboxAIModel || chatboxAIModels[0])
  }

  async callImageGeneration(prompt: string, signal?: AbortSignal): Promise<string> {
    const res = await apiRequest.post(
      `${remote.API_ORIGIN}/api/ai/paint`,
      this.getHeaders(),
      {
        prompt,
        response_format: 'b64_json',
        style: this.options.dalleStyle,
        uuid: this.config.uuid,
        language: this.options.language,
      },
      { signal }
    )
    const json = await res.json()
    return json['data'][0]['b64_json']
  }

  protected async callChatCompletion(
    rawMessages: Message[],
    options: CallChatCompletionOptions
  ): Promise<StreamTextResult> {
    const messages = await populateChatboxAIMessage(rawMessages)

    let webBrowsingResult: Awaited<ReturnType<typeof remote.webBrowsing>> | undefined = undefined
    if (options?.webBrowsing) {
      webBrowsingResult = await remote.webBrowsing({
        licenseKey: this.options.licenseKey || '',
        messages,
      })
      if (webBrowsingResult.uuid) {
        messages.push({
          role: 'user',
          content: '',
          web_browsing: {
            uuid: webBrowsingResult.uuid,
          },
        }) // 临时地将搜索结果添加到上下文中，方便根据搜索结果生成回答
      }
    }

    const response = await this.post(
      `${remote.API_ORIGIN}/api/ai/chat`,
      this.getHeaders(),
      {
        uuid: this.config.uuid,
        model: this.options.chatboxAIModel || 'chatboxai-3.5',
        messages,
        // max_tokens: maxTokensNumber,
        temperature: this.options.temperature,
        language: this.options.language,
        stream: true,
      },
      { signal: options.signal }
    )
    let result = ''
    let reasoningContent: string | undefined = undefined
    await handleSSE(response, (message) => {
      if (message === '[DONE]') {
        return
      }
      const data = JSON.parse(message)
      if (data.error) {
        throw new ApiError(`Error from Chatbox AI: ${JSON.stringify(data)}`)
      }
      const word = data.choices[0]?.delta?.content
      const reasoningContentPart = data.choices[0]?.delta?.reasoning_content
      if (reasoningContentPart !== undefined) {
        if (!reasoningContent) {
          reasoningContent = ''
        }
        reasoningContent += reasoningContentPart
        options.onResultChange?.({ reasoningContent })
      }
      if (word !== undefined) {
        result += word
        options.onResultChange?.({ contentParts: [{ type: 'text', text: result }], reasoningContent })
      }
    })

    // 如果开启了 webBrowsing，则将 webBrowsing 的结果添加到生成的助手消息中
    // 后续聊天中，服务端会根据 uuid 填充搜索结果
    if (webBrowsingResult) {
      options.onResultChange?.({
        contentParts: [{ type: 'text', text: result }],
        webBrowsing: {
          chatboxAIWebBrowsingUUID: webBrowsingResult.uuid,
          query: webBrowsingResult.query,
          links: webBrowsingResult.links,
        },
      })
    }

    return {
      contentParts: [{ type: 'text', text: result }],
      reasoningContent,
    }
  }

  getHeaders() {
    const license = this.options.licenseKey || ''
    const instanceId = (this.options.licenseInstances ? this.options.licenseInstances[license] : '') || ''
    const headers: Record<string, string> = {
      Authorization: license,
      'Instance-Id': instanceId,
      'Content-Type': 'application/json',
    }
    return headers
  }

  async post(
    url: string,
    headers: Record<string, string>,
    body: Record<string, any>,
    options?: {
      signal?: AbortSignal
      retry?: number
      useProxy?: boolean
    }
  ) {
    const { signal, retry = 3, useProxy = false } = options || {}
    let requestError: BaseError | null = null
    for (let i = 0; i < retry + 1; i++) {
      try {
        const res = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify(body),
          signal,
        })
        // 状态码不在 200～299 之间，一般是接口报错了，这里也需要抛错后重试
        if (!res.ok) {
          const response = await res.text().catch((e) => '')
          const errorCodeName = parseJsonOrEmpty(response)?.error?.code
          const chatboxAIError = ChatboxAIAPIError.fromCodeName(response, errorCodeName)
          if (chatboxAIError) {
            throw chatboxAIError
          }
          throw new ApiError(`Status Code ${res.status}, ${response}`)
        }
        return res
      } catch (e) {
        if (e instanceof BaseError) {
          requestError = e
        } else {
          const err = e as Error
          const origin = new URL(url).origin
          requestError = new NetworkError(err.message, origin)
        }
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
    if (requestError) {
      throw requestError
    } else {
      throw new Error('Unknown error')
    }
  }

  async get(
    url: string,
    headers: Record<string, string>,
    options?: {
      signal?: AbortSignal
      retry?: number
    }
  ) {
    const { signal, retry = 3 } = options || {}
    let requestError: BaseError | null = null
    for (let i = 0; i < retry + 1; i++) {
      try {
        const res = await fetch(url, {
          method: 'GET',
          headers,
          signal,
        })
        // 状态码不在 200～299 之间，一般是接口报错了，这里也需要抛错后重试
        if (!res.ok) {
          const response = await res.text().catch((e) => '')
          const errorCodeName = parseJsonOrEmpty(response)?.error?.code
          const chatboxAIError = ChatboxAIAPIError.fromCodeName(response, errorCodeName)
          if (chatboxAIError) {
            throw chatboxAIError
          }
          throw new ApiError(`Status Code ${res.status}, ${response}`)
        }
        return res
      } catch (e) {
        if (e instanceof BaseError) {
          requestError = e
        } else {
          const err = e as Error
          const origin = new URL(url).origin
          requestError = new NetworkError(err.message, origin)
        }
      }
    }
    if (requestError) {
      throw requestError
    } else {
      throw new Error('Unknown error')
    }
  }
}

// Chatbox AI 服务接收的消息格式
export interface ChatboxAIMessage {
  role: MessageRole
  content: string
  pictures?: {
    base64?: string
  }[]
  files?: {
    uuid: string
  }[]
  links?: {
    uuid: string
    url: string
  }[]
  web_browsing?: {
    uuid: string
  }
}

export async function populateChatboxAIMessage(rawMessages: Message[]): Promise<ChatboxAIMessage[]> {
  // 将 Message 转换为 OpenAIMessage，清理掉会报错的多余的字段
  const messages: ChatboxAIMessage[] = []
  for (const raw of rawMessages) {
    const newMessage: ChatboxAIMessage = {
      role: raw.role,
      content: getMessageText(raw),
    }
    for (const p of raw.contentParts) {
      if (p.type === 'image') {
        if (!p.storageKey) {
          continue
        }
        const base64 = await storage.getBlob(p.storageKey)
        if (!base64) {
          continue
        }
        if (!newMessage.pictures) {
          newMessage.pictures = []
        }
        newMessage.pictures.push({ base64 })
      }
    }

    for (const file of raw.files || []) {
      if (!file.chatboxAIFileUUID) {
        continue
      }
      if (!newMessage.files) {
        newMessage.files = []
      }
      newMessage.files.push({ uuid: file.chatboxAIFileUUID })
    }
    for (const link of raw.links || []) {
      if (!link.chatboxAILinkUUID || !link.url) {
        continue
      }
      if (!newMessage.links) {
        newMessage.links = []
      }
      newMessage.links.push({ uuid: link.chatboxAILinkUUID, url: link.url })
    }
    if (raw.webBrowsing && raw.webBrowsing.chatboxAIWebBrowsingUUID) {
      newMessage.web_browsing = {
        uuid: raw.webBrowsing.chatboxAIWebBrowsingUUID,
      }
    }
    messages.push(newMessage)
  }
  return messages
}
