import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import BaseConfig from './base-config'
import XAI, { xAIModels } from '../models/xai'

export default class XAISettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `xAI API (${settings.xAIModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.xAIModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [
      {
        options: xAIModels.map((value) => {
          return {
            label: value,
            value: value,
          }
        }),
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    const xai = new XAI(settings)
    return xai.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      xAIModel: selected,
    }
  }

  isCurrentModelSupportImageInput(settings: ModelSettings): boolean {
    return XAI.helpers.isModelSupportVision(settings.xAIModel)
  }

  isCurrentModelSupportToolUse(settings: ModelSettings): boolean {
    return XAI.helpers.isModelSupportToolUse(settings.xAIModel)
  }
}
