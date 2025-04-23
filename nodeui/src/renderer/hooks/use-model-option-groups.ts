import { getModelSettingUtil } from '@/packages/model-setting-utils'
import type { ModelOptionGroup, ModelSettings } from 'src/shared/types'
import useSWR from 'swr'

export function useModelOptionGroups(
  settings: ModelSettings,
  cacheKeys: (string | undefined)[]
): { optionGroups: ModelOptionGroup[] } {
  const util = getModelSettingUtil(settings.aiProvider)
  const { data: optionGroups } = useSWR(
    ['model-option-groups', settings.aiProvider, ...cacheKeys],
    async () => {
      return util.getMergeOptionGroups(settings)
    },
    {
      fallbackData: util.getLocalOptionGroups(settings),
    }
  )
  return { optionGroups }
}
