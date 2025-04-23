import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import SimpleSelect from '../SimpleSelect'
import { ModelSelectProps } from './types'

export default function DeepSeekModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.deepseekAPIKey])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <SimpleSelect
      label={t('model')}
      value={settingsEdit.deepseekModel}
      options={simpleOptions}
      onChange={(value) => props.setSettingsEdit({ ...settingsEdit, deepseekModel: value })}
      className={props.className}
    />
  )
}
