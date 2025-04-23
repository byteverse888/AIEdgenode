import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import Groq from '../models/groq'
import BaseConfig from './base-config'
import { ModelSettingUtil } from './interface'

export default class GroqSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `Groq API (${settings.groqModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.groqModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return []
  }

  protected async listProviderModels(settings: ModelSettings) {
    const groq = new Groq(settings)
    return groq.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      groqModel: selected,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return Groq.helpers.isModelSupportVision(settings.groqModel)
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return Groq.helpers.isModelSupportToolUse(settings.groqModel)
  }
}
