import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from '../../../shared/types'
import SimpleSelect from '../SimpleSelect'
import { ModelSelectProps } from './types'

export default function GeminiModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.geminiAPIHost, settingsEdit.geminiAPIKey])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <SimpleSelect
      label={t('model')}
      value={settingsEdit.geminiModel}
      options={simpleOptions}
      onChange={(value) =>
        props.setSettingsEdit({ ...settingsEdit, geminiModel: value as ModelSettings['geminiModel'] })
      }
      className={props.className}
    />
  )
}
