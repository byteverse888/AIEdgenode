import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import * as settingActions from '../../stores/settingActions'
import BaseConfig from './base-config'

export default class CustomModelSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    const customProvider = settings.customProviders?.find(
      (provider) => provider.id === settings.selectedCustomProviderId
    )
    if (!customProvider) {
      return 'unknown'
    }
    return `${customProvider.name}(${customProvider.model})`
  }

  getCurrentModelOptionValue(settings: Settings) {
    const customProvider = settings.customProviders?.find(
      (provider) => provider.id === settings.selectedCustomProviderId
    )
    if (!customProvider) {
      return 'unknown'
    }
    return customProvider.model
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    const customProvider = settings.customProviders?.find(
      (provider) => provider.id === settings.selectedCustomProviderId
    )
    if (!customProvider) {
      return []
    }
    const models = customProvider.modelOptions || []
    if (!models.includes(customProvider.model)) {
      models.push(customProvider.model)
    }
    return [
      {
        options: models.map((model) => ({
          label: model,
          value: model,
        })),
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    return []
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    const globalSettings = settingActions.getSettings()
    const selectedCustomProviderId = settings?.selectedCustomProviderId || globalSettings.selectedCustomProviderId
    const customProviders = globalSettings.customProviders.map((provider) => {
      if (provider.id === selectedCustomProviderId) {
        return { ...provider, model: selected }
      }
      return provider
    })
    return {
      ...settings,
      customProviders,
    }
  }

  isCurrentModelSupportImageInput(settings: ModelSettings) {
    return true
  }

  isCurrentModelSupportToolUse(settings: ModelSettings) {
    return false
  }
}
