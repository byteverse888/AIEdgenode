import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import BaseConfig from './base-config'
import DeepSeek, { deepSeekModels } from '../models/deepseek'

export default class DeepSeekSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `DeepSeek API (${settings.deepseekModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.deepseekModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [
      {
        options: deepSeekModels.map((value) => {
          return {
            label: value,
            value: value,
          }
        }),
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    const deepSeek = new DeepSeek(settings)
    return deepSeek.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      deepseekModel: selected,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return DeepSeek.helpers.isModelSupportVision(settings.deepseekModel)
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return DeepSeek.helpers.isModelSupportToolUse(settings.deepseekModel)
  }
}
