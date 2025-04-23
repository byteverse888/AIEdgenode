import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from 'src/shared/types'
import SimpleSelect from '../SimpleSelect'
import { ModelSelectProps } from './types'

export function PerplexityModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.perplexityApiKey])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <SimpleSelect
      label={t('model')}
      value={settingsEdit.perplexityModel}
      options={simpleOptions}
      onChange={(value) =>
        props.setSettingsEdit({ ...settingsEdit, perplexityModel: value as ModelSettings['perplexityModel'] })
      }
      className={props.className}
    />
  )
}
