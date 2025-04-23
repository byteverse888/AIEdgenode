import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import BaseConfig from './base-config'
import LMStudio from '../models/lmstudio'

export default class LMStudioSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `LM Studio (${settings.lmStudioModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.lmStudioModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return []
  }

  protected async listProviderModels(settings: ModelSettings) {
    const lmStudio = new LMStudio(settings)
    return lmStudio.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      lmStudioModel: selected,
    }
  }

  isCurrentModelSupportImageInput(settings: ModelSettings): boolean {
    return LMStudio.helpers.isModelSupportVision(settings.lmStudioModel)
  }

  isCurrentModelSupportToolUse(settings: ModelSettings): boolean {
    return LMStudio.helpers.isModelSupportToolUse(settings.lmStudioModel)
  }
}
