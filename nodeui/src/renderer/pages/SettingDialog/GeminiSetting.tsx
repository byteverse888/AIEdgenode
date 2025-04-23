import { Box, Link, Alert, Typography, Stack } from '@mui/material'
import { Accordion, AccordionSummary, AccordionDetails } from '@/components/Accordion'
import { ModelSettings, ModelProvider } from '@/../shared/types'
import { useTranslation, Trans } from 'react-i18next'
import PasswordTextField from '@/components/PasswordTextField'
import TemperatureSlider from '@/components/TemperatureSlider'
import platform from '@/platform'
import TextFieldReset from '@/components/TextFieldReset'
import GeminiModelSelect from '@/components/model-select/GeminiModelSelect'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import { remoteConfigAtom } from '@/stores/atoms'
import { useAtomValue } from 'jotai'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function GeminiSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const remoteConfig = useAtomValue(remoteConfigAtom)
  return (
    <Stack spacing={2}>
      <PasswordTextField
        label={t('api key')}
        value={settingsEdit.geminiAPIKey}
        setValue={(value) => {
          setSettingsEdit({ ...settingsEdit, geminiAPIKey: value })
        }}
        helperText={
          <Link className="cursor-pointer" onClick={() => platform.openLink('https://makersuite.google.com/')}>
            {t('Get API key in Google AI Studio')}
          </Link>
        }
      />
      <TextFieldReset
        margin="dense"
        label={t('api host')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.geminiAPIHost}
        placeholder="https://generativelanguage.googleapis.com"
        defaultValue="https://generativelanguage.googleapis.com"
        onValueChange={(value) => {
          value = value.trim()
          if (value.length > 4 && !value.startsWith('http')) {
            value = 'https://' + value
          }
          setSettingsEdit({ ...settingsEdit, geminiAPIHost: value })
        }}
      />
      {settingsEdit.geminiAPIHost !== 'https://generativelanguage.googleapis.com' &&
        remoteConfig.setting_chatboxai_first && (
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
      <GeminiModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
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
