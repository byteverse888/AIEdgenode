import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import ChatGLM, { chatglmModels } from '../models/chatglm'
import BaseConfig from './base-config'
import { ModelSettingUtil } from './interface'

export default class ChatGLMSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return settings.chatglmModel
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.chatglmModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [{ options: chatglmModels.map((model) => ({ label: model, value: model })) }]
  }

  protected async listProviderModels(settings: ModelSettings) {
    return []
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      chatglmModel: selected,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return ChatGLM.helpers.isModelSupportVision(settings.chatglmModel)
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return ChatGLM.helpers.isModelSupportToolUse(settings.chatglmModel)
  }
}
