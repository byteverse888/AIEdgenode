import { ModelSettings, Session, SessionType, Settings } from 'src/shared/types'
import { ModelSettingUtil } from './interface'
import AzureOpenAI from '../models/azure'
import BaseConfig from './base-config'

export default class AzureSettingUtil extends BaseConfig implements ModelSettingUtil {
  async getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string> {
    if (sessionType === 'picture') {
      return `Azure OpenAI API (${settings.azureDalleDeploymentName})`
    } else {
      return `Azure OpenAI API (${settings.azureDeploymentName})`
    }
  }

  getCurrentModelOptionValue(settings: Settings) {
    return settings.azureDeploymentName
  }

  public getLocalOptionGroups(settings: ModelSettings) {
    const options = settings.azureDeploymentNameOptions.map((option) => ({
      label: option,
      value: option,
    }))
    if (!options.some((option) => option.value === settings.azureDeploymentName)) {
      options.push({
        label: settings.azureDeploymentName,
        value: settings.azureDeploymentName,
      })
    }
    return [
      {
        options,
      },
    ]
  }

  protected async listProviderModels(settings: ModelSettings) {
    return []
  }

  selectSessionModel(settings: Session['settings'], selected: string): Session['settings'] {
    return {
      ...settings,
      azureDeploymentName: selected,
    }
  }

  public isCurrentModelSupportImageInput(settings: ModelSettings) {
    return AzureOpenAI.helpers.isModelSupportVision(settings.azureDeploymentName)
  }

  public isCurrentModelSupportToolUse(settings: ModelSettings) {
    return AzureOpenAI.helpers.isModelSupportToolUse(settings.azureDeploymentName)
  }
}
