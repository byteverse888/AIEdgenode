import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from 'src/shared/types'
import SimpleSelect from '../SimpleSelect'
import { ModelSelectProps } from './types'

export function OllamaModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.ollamaHost])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <SimpleSelect
      label={t('model')}
      value={settingsEdit.ollamaModel}
      options={simpleOptions}
      onChange={(value) =>
        props.setSettingsEdit({ ...settingsEdit, ollamaModel: value as ModelSettings['ollamaModel'] })
      }
    />
  )
}
