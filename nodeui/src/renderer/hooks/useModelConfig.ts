import { useEffect, useMemo, useState, useRef } from 'react'
import { ModelOptionGroup, Settings, ModelProvider } from '../../shared/types'
import { getModelSettingUtil } from '../packages/model-setting-utils'

export default function useModelConfig(settings: Settings, aiProvider?: ModelProvider) {
  const modelConfig = getModelSettingUtil(aiProvider || settings.aiProvider)

  const [optionGroups, setOptionGroups] = useState<ModelOptionGroup[]>(modelConfig.getLocalOptionGroups(settings))

  const latestRequestId = useRef(0)
  const refreshWithRemoteOptionGroups = async () => {
    const requestId = ++latestRequestId.current
    const mergedOptions = await modelConfig.getMergeOptionGroups(settings)
    if (requestId === latestRequestId.current) {
      setOptionGroups(mergedOptions)
    }
  }

  useEffect(() => {
    setOptionGroups(modelConfig.getLocalOptionGroups(settings))
    refreshWithRemoteOptionGroups()
  }, [settings])

  const currentModelOptionValue = modelConfig.getCurrentModelOptionValue(settings)
  const currentModelOptionLabel = useMemo(() => {
    for (const optionGroup of optionGroups) {
      const option = optionGroup.options.find((option) => option.value === currentModelOptionValue)
      if (option) {
        return option.label
      }
    }
    return currentModelOptionValue
  }, [optionGroups, currentModelOptionValue])

  return {
    optionGroups,
    currentOption: {
      label: currentModelOptionLabel,
      value: currentModelOptionValue,
    },
    refreshWithRemoteOptionGroups,
  }
}
