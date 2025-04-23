import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from '../../../shared/types'
import SimpleSelect from '../SimpleSelect'
import { ModelSelectProps } from './types'

export default function GropModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.groqAPIKey])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <SimpleSelect
      label={t('model')}
      value={settingsEdit.groqModel}
      options={simpleOptions}
      onChange={(value) => props.setSettingsEdit({ ...settingsEdit, groqModel: value as ModelSettings['groqModel'] })}
      className={props.className}
    />
  )
}
