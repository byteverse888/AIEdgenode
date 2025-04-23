import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import Ollama from '../models/ollama'
import BaseConfig from './base-config'

export default class OllamaSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    return `Ollama (${settings.ollamaModel})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.ollamaModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return []
  }

  protected async listProviderModels(settings: ModelSettings) {
    const ollama = new Ollama(settings)
    return ollama.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      ollamaModel: selected,
    }
  }

  isCurrentModelSupportImageInput(settings: ModelSettings): boolean {
    return Ollama.helpers.isModelSupportVision(settings.ollamaModel)
  }

  isCurrentModelSupportToolUse(settings: ModelSettings): boolean {
    return Ollama.helpers.isModelSupportToolUse(settings.ollamaModel)
  }
}
