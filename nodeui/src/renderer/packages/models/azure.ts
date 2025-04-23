import { createAzure } from '@ai-sdk/azure'
import AbstractAISDKModel from './abstract-ai-sdk'
import { ModelHelpers } from './base'

const helpers: ModelHelpers = {
  isModelSupportVision: (model: string) => {
    return true
  },
  isModelSupportToolUse: (model: string) => {
    return true
  },
}

interface Options {
  azureEndpoint: string
  azureDeploymentName: string
  azureDalleDeploymentName: string // dall-e-3 的部署名称
  azureApikey: string
  azureApiVersion: string

  // openaiMaxTokens: number
  temperature: number
  topP: number

  dalleStyle: 'vivid' | 'natural'
  imageGenerateNum: number // 生成图片的数量

  injectDefaultMetadata: boolean
}

export default class AzureOpenAI extends AbstractAISDKModel {
  public name = 'Azure OpenAI'
  public static helpers = helpers

  constructor(public options: Options) {
    super()
  }

  private getProvider() {
    const origin = new URL(this.options.azureEndpoint.trim()).origin
    return createAzure({
      apiKey: this.options.azureApikey,
      apiVersion: this.options.azureApiVersion,
      baseURL: origin + '/openai/deployments',
    })
  }

  protected getChatModel() {
    const provider = this.getProvider()
    return provider.chat(this.options.azureDeploymentName)
  }

  protected getImageModel() {
    const provider = this.getProvider()
    return provider.imageModel(this.options.azureDalleDeploymentName)
  }

  public isSupportToolUse() {
    return helpers.isModelSupportToolUse(this.options.azureDeploymentName)
  }
}
