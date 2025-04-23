import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import Perplexity, { perplexityModels } from '../models/perplexity'
import BaseConfig from './base-config'
import { ModelSettingUtil } from './interface'

export default class PerplexitySettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `Perplexity API (${settings.perplexityModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.perplexityModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [{ options: perplexityModels.map((model) => ({ label: model, value: model })) }]
  }

  protected async listProviderModels(settings: ModelSettings) {
    return []
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      perplexityModel: selected,
    }
  }

  isCurrentModelSupportImageInput(settings: ModelSettings): boolean {
    return Perplexity.helpers.isModelSupportVision(settings.perplexityModel)
  }

  isCurrentModelSupportToolUse(settings: ModelSettings): boolean {
    return Perplexity.helpers.isModelSupportToolUse(settings.perplexityModel)
  }
}
