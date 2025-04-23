import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import Claude, { claudeModels } from '../models/claude'
import BaseConfig from './base-config'
import { ModelSettingUtil } from './interface'

export default class ClaudeSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType) {
    return `Claude API (${settings.claudeModel || 'unknown'})`
  }

  getCurrentModelOptionValue(settings: Settings): string {
    return settings.claudeModel
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    return [
      {
        options: claudeModels.map((value) => ({
          label: value,
          value: value,
        })),
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    const claude = new Claude(settings)
    return claude.listModels()
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      claudeModel: selected,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return Claude.helpers.isModelSupportVision(settings.claudeModel)
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return Claude.helpers.isModelSupportToolUse(settings.claudeModel)
  }
}
