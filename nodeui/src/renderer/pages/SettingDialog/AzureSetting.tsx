import { Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { ModelSettings } from '../../../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '../../components/Accordion'
import PasswordTextField from '../../components/PasswordTextField'
import TemperatureSlider from '../../components/TemperatureSlider'
import TopPSlider from '../../components/TopPSlider'
// import TokenConfig from './TokenConfig'
import CreatableSelect from '@/components/CreatableSelect'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import { useIsSmallScreen } from '@/hooks/useScreenChange'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function AzureSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const isSmallScreen = useIsSmallScreen()
  return (
    <Stack spacing={2}>
      <TextField
        placeholder="https://<resource_name>.openai.azure.com/"
        autoFocus={!isSmallScreen}
        margin="dense"
        label={t('Azure Endpoint')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.azureEndpoint}
        onChange={(e) =>
          setSettingsEdit({
            ...settingsEdit,
            azureEndpoint: e.target.value.trim(),
          })
        }
      />
      <TextField
        placeholder="2024-05-01-preview"
        margin="dense"
        label={t('Azure API Version')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.azureApiVersion}
        onChange={(e) =>
          setSettingsEdit({
            ...settingsEdit,
            azureApiVersion: e.target.value.trim(),
          })
        }
      />
      <PasswordTextField
        label={t('Azure API Key')}
        value={settingsEdit.azureApikey}
        setValue={(value) => {
          setSettingsEdit({ ...settingsEdit, azureApikey: value })
        }}
      />
      <CreatableSelect
        label={t('Azure Deployment Name')}
        value={settingsEdit.azureDeploymentName}
        options={settingsEdit.azureDeploymentNameOptions}
        onChangeValue={(v) => setSettingsEdit({ ...settingsEdit, azureDeploymentName: v })}
        onUpdateOptions={(v) => setSettingsEdit({ ...settingsEdit, azureDeploymentNameOptions: v })}
      />
      <TextField
        margin="dense"
        label={t('Azure Dall-E Deployment Name')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.azureDalleDeploymentName}
        onChange={(e) =>
          setSettingsEdit({
            ...settingsEdit,
            azureDalleDeploymentName: e.target.value.trim(),
          })
        }
      />
      <Accordion>
        <AccordionSummary aria-controls="panel1a-content">
          <Typography>{t('Advanced')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <MaxContextMessageCountSlider
            value={toBeRemoved_getContextMessageCount(
              settingsEdit.openaiMaxContextMessageCount,
              settingsEdit.maxContextMessageCount
            )}
            onChange={(v) => setSettingsEdit({ ...settingsEdit, maxContextMessageCount: v })}
          />
          <TemperatureSlider
            value={settingsEdit.temperature}
            onChange={(v) => setSettingsEdit({ ...settingsEdit, temperature: v })}
          />
          <TopPSlider topP={settingsEdit.topP} setTopP={(v) => setSettingsEdit({ ...settingsEdit, topP: v })} />
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}
