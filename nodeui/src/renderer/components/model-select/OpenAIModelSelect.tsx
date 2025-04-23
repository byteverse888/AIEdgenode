import CreatableSelect from '@/components/CreatableSelect'
import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material'
import { flatten } from 'lodash'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from '../../../shared/types'
import { ModelSelectProps } from './types'

export default function OpenAIModelSelect(props: ModelSelectProps) {
  const { settingsEdit, setSettingsEdit, className } = props
  const { t } = useTranslation()
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.apiHost, settingsEdit.openaiKey])
  const simpleOptions = flatten(optionGroups.map((group) => group.options))
  return (
    <FormControl fullWidth variant="outlined" margin="dense" className={className}>
      <InputLabel htmlFor="model-select">{t('model')}</InputLabel>
      <Select
        label={t('model')}
        id="model-select"
        value={settingsEdit.model}
        onChange={(e) => setSettingsEdit({ ...settingsEdit, model: e.target.value as ModelSettings['model'] })}
      >
        {simpleOptions.map(({ value: model }) => (
          <MenuItem key={model} value={model}>
            {model}
          </MenuItem>
        ))}
        <MenuItem key="custom-model" value={'custom-model'}>
          {t('Custom Model')}
        </MenuItem>
      </Select>
      {settingsEdit.model === 'custom-model' && (
        <CreatableSelect
          label={t('Custom Model Name')}
          value={settingsEdit.openaiCustomModel || ''}
          options={settingsEdit.openaiCustomModelOptions}
          onChangeValue={(updated) => setSettingsEdit({ ...settingsEdit, openaiCustomModel: updated })}
          onUpdateOptions={(updated) => setSettingsEdit({ ...settingsEdit, openaiCustomModelOptions: updated })}
        />
      )}
    </FormControl>
  )
}
