import { ChatboxAIModel, ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import { chatboxAIModels } from '../models/chatboxai'
import BaseConfig from './base-config'
import { ModelOptionGroup } from 'src/shared/types'
import ChatboxAI from '../models/chatboxai'

function formatModelLabel(value: string): string {
  if (value === 'deepseek-chat') {
    return 'DeepSeek V3'
  } else if (value === 'deepseek-reasoner') {
    return 'DeepSeek R1'
  }
  return value.replace('chatboxai-', 'Chatbox AI ')
}

export default class ChatboxAISettingUtil extends BaseConfig implements ModelSettingUtil {
  private async getCurrentModelOptionLabel(settings: Settings): Promise<string> {
    const currentValue = this.getCurrentModelOptionValue(settings)
    const optionGroups = await this.getMergeOptionGroups(settings)
    for (const optionGroup of optionGroups) {
      const option = optionGroup.options.find((option) => option.value === currentValue)
      if (option) {
        return option.label
      }
    }
    return currentValue
  }

  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    if (sessionType === 'picture') {
      return `Chatbox AI (DALL-E-3)`
    } else {
      // const model = settings.chatboxAIModel || 'chatboxai-3.5'
      let model = await this.getCurrentModelOptionLabel(settings)
      if (!model.toLowerCase().includes('chatbox')) {
        model = `Chatbox AI (${model})`
      }
      model = model.replace('chatboxai-', 'Chatbox AI ')
      return model
    }
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.chatboxAIModel || 'chatboxai-3.5'
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [
      {
        options: chatboxAIModels.map((value) => ({
          label: formatModelLabel(value),
          value: value,
        })),
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    return []
  }

  protected mergeOptionGroups(localOptionGroups: ModelOptionGroup[], remoteOptionGroups: ModelOptionGroup[]) {
    const ret = [...remoteOptionGroups, ...localOptionGroups]
    const existedOptionSet = new Set<string>()
    for (const group of ret) {
      group.options = group.options.filter((option) => {
        const existed = existedOptionSet.has(option.value)
        existedOptionSet.add(option.value)
        return !existed
      })
    }
    return ret.filter((group) => group.options.length > 0)
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      chatboxAIModel: selected as ChatboxAIModel,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return ChatboxAI.helpers.isModelSupportVision(settings.chatboxAIModel || chatboxAIModels[0])
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return ChatboxAI.helpers.isModelSupportToolUse(settings.chatboxAIModel || chatboxAIModels[0])
  }
}
