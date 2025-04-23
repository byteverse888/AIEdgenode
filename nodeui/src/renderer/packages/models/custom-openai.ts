import { fetchWithProxy } from '@/utils/request'
import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { extractReasoningMiddleware, wrapLanguageModel } from 'ai'
import AbstractAISDKModel from './abstract-ai-sdk'
import { ModelHelpers } from './base'
import { normalizeOpenAIApiHostAndPath } from './llm_utils'
import { OpenAIModel, openaiModelConfigs } from './openai'

const helpers: ModelHelpers = {
  isModelSupportVision: (model: string) => {
    // TODO: 需要由用户设置,
    return !!openaiModelConfigs[model as OpenAIModel]?.vision
  },
  isModelSupportToolUse: (model: string) => {
    // TODO: 需要由用户设置
    return false
  },
}

interface Options {
  apiKey: string
  apiHost: string
  apiPath: string
  model: string
  useProxy?: boolean
  temperature?: number
  topP?: number
}

export default class CustomOpenAI extends AbstractAISDKModel {
  public name = 'Custom'
  public static helpers = helpers
  public options: Options

  constructor(options: Options) {
    super()
    const { apiHost, apiPath } = normalizeOpenAIApiHostAndPath({ apiHost: options.apiHost, apiPath: options.apiPath })
    this.options = { ...options, apiHost, apiPath }
  }

  protected getCallSettings() {
    return {
      temperature: this.options.temperature,
      topP: this.options.topP,
    }
  }

  private getProvider() {
    const fetcher = this.options.useProxy ? fetchWithProxy : fetch
    return createOpenAICompatible({
      name: this.name,
      apiKey: this.options.apiKey,
      baseURL: this.options.apiHost,
      fetch: async (_input, init) => {
        return fetcher(`${this.options.apiHost}${this.options.apiPath}`, init)
      },
      headers: this.options.apiHost.includes('openrouter.ai')
        ? {
            'HTTP-Referer': 'https://chatboxai.app',
            'X-Title': 'Chatbox AI',
          }
        : undefined,
    })
  }

  protected getChatModel() {
    const provider = this.getProvider()
    return wrapLanguageModel({
      model: provider.chatModel(this.options.model),
      middleware: extractReasoningMiddleware({ tagName: 'think' }),
    })
  }

  public isSupportToolUse() {
    return helpers.isModelSupportToolUse(this.options.model)
  }
}
