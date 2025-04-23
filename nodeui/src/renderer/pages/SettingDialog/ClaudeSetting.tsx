import { Box, Typography, Alert, Stack } from '@mui/material'
import { ModelSettings, ModelProvider } from '@/../shared/types'
import { useTranslation, Trans } from 'react-i18next'
import TemperatureSlider from '@/components/TemperatureSlider'
import PasswordTextField from '@/components/PasswordTextField'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import ClaudeModelSelect from '@/components/model-select/ClaudeModelSelect'
import TextFieldReset from '@/components/TextFieldReset'
import { Accordion, AccordionSummary, AccordionDetails } from '@/components/Accordion'
import { remoteConfigAtom } from '@/stores/atoms'
import { useAtomValue } from 'jotai'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function ClaudeSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const remoteConfig = useAtomValue(remoteConfigAtom)
  return (
    <Stack spacing={2}>
      <PasswordTextField
        label={t('api key')}
        value={settingsEdit.claudeApiKey}
        setValue={(value) => {
          setSettingsEdit({ ...settingsEdit, claudeApiKey: value })
        }}
      />
      <TextFieldReset
        margin="dense"
        label={t('api host')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.claudeApiHost}
        placeholder="https://api.anthropic.com"
        defaultValue="https://api.anthropic.com"
        onValueChange={(value) => {
          value = value.trim()
          if (value.length > 4 && !value.startsWith('http')) {
            value = 'https://' + value
          }
          setSettingsEdit({ ...settingsEdit, claudeApiHost: value })
        }}
      />
      {settingsEdit.claudeApiHost !== 'https://api.anthropic.com' && remoteConfig.setting_chatboxai_first && (
        <Alert icon={false} severity="info" className="my-4">
          <Trans
            i18nKey="Please note that as a client tool, Chatbox cannot guarantee the quality of service and data privacy of the model providers. If you are looking for a stable, reliable, and privacy-protecting model service, consider <a>Chatbox AI</a>."
            components={{
              a: (
                <a
                  className="cursor-pointer font-bold"
                  onClick={() => {
                    setSettingsEdit({
                      ...settingsEdit,
                      aiProvider: ModelProvider.ChatboxAI,
                      selectedCustomProviderId: '',
                    })
                  }}
                ></a>
              ),
            }}
          />
        </Alert>
      )}
      <ClaudeModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
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
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}
