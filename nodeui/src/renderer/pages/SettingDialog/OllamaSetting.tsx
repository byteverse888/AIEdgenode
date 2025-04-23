import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import { OllamaModelSelect } from '@/components/model-select/OllamaModelSelect'
import TemperatureSlider from '@/components/TemperatureSlider'
import TextFieldReset from '@/components/TextFieldReset'
import platform from '@/platform'
import { languageAtom } from '@/stores/atoms'
import { Alert, Stack, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Trans, useTranslation } from 'react-i18next'
import { ModelSettings } from '@/../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '@/components/Accordion'

export function OllamaHostInput(props: {
  ollamaHost: string
  setOllamaHost: (host: string) => void
  className?: string
}) {
  const { t } = useTranslation()
  const language = useAtomValue(languageAtom)
  return (
    <>
      <TextFieldReset
        label={t('api host')}
        value={props.ollamaHost}
        defaultValue="http://localhost:11434"
        onValueChange={props.setOllamaHost}
        fullWidth
        className={props.className}
      />
      <Alert icon={false} severity="info" className="my-4">
        {platform.type === 'web' && (
          <p>
            <Trans
              i18nKey="Get better connectivity and stability with the Chatbox desktop application. <a>Download now</a>."
              components={{
                a: (
                  <a
                    className="cursor-pointer font-bold"
                    onClick={() => {
                      platform.openLink(`https://chatboxai.app`)
                    }}
                  ></a>
                ),
              }}
            />
          </p>
        )}
        <p>
          <Trans
            i18nKey="Please ensure that the Remote Ollama Service is able to connect remotely. For more details, refer to <a>this tutorial</a>."
            components={{
              a: (
                <a
                  className="cursor-pointer font-bold"
                  onClick={() => {
                    platform.openLink(`https://chatboxai.app/redirect_app/ollama_guide/${language}`)
                  }}
                ></a>
              ),
            }}
          />
        </p>
      </Alert>
    </>
  )
}

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function OllamaSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  return (
    <Stack spacing={2}>
      <OllamaHostInput
        ollamaHost={settingsEdit.ollamaHost}
        setOllamaHost={(v) => setSettingsEdit({ ...settingsEdit, ollamaHost: v })}
      />
      <OllamaModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
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
