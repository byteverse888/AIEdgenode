import { ModelOptionGroup, ModelSettings, Settings } from '../../../shared/types'
import * as Sentry from '@sentry/react'
import * as remote from '../../packages/remote'

export default abstract class BaseConfig {
  public abstract getLocalOptionGroups(settings: ModelSettings): ModelOptionGroup[]
  protected abstract listProviderModels(settings: ModelSettings): Promise<string[]>
  public abstract isCurrentModelSupportImageInput(settings: ModelSettings): boolean
  public abstract isCurrentModelSupportToolUse(settings: ModelSettings): boolean

  // 有三个来源：本地写死、后端配置、服务商模型列表
  public async getMergeOptionGroups(settings: ModelSettings): Promise<ModelOptionGroup[]> {
    const localOptionGroups = this.getLocalOptionGroups(settings)
    const [modelConfigs, models] = await Promise.all([
      remote.getModelConfigsWithCache(settings).catch((e) => {
        Sentry.captureException(e)
        return { option_groups: [] as ModelOptionGroup[] }
      }),
      this.listProviderModels(settings).catch((e) => {
        Sentry.captureException(e)
        return []
      }),
    ])
    const remoteOptionGroups = [
      ...modelConfigs.option_groups,
      ...models.map((model) => ({ options: [{ label: model, value: model }] })),
    ]
    return this.mergeOptionGroups(localOptionGroups, remoteOptionGroups)
  }

  /**
   * 合并本地与远程的模型选项组。
   * 在返回的选项组中，本地选项组中独有的选项将会出现在第一个选项组，其余选项组将为远程选项组。
   * @param localOptionGroups 本地模型选项组
   * @param remoteOptionGroups 远程模型选项组
   * @returns
   */
  protected mergeOptionGroups(localOptionGroups: ModelOptionGroup[], remoteOptionGroups: ModelOptionGroup[]) {
    const ret = [...localOptionGroups, ...remoteOptionGroups]
    const existedOptionSet = new Set<string>()
    for (const group of ret) {
      group.options = group.options.filter((option) => {
        const existed = existedOptionSet.has(option.value)
        existedOptionSet.add(option.value)
        return !existed
      })
    }
    return ret.filter((group) => group.options.length > 0)
  }

  getCurrentModelOptionValue(settings: Settings) {
    return ''
  }
}
