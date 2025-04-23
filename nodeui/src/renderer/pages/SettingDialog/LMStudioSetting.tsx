import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import LMStudioModelSelect from '@/components/model-select/LMStudioModelSelect'
import TemperatureSlider from '@/components/TemperatureSlider'
import TextFieldReset from '@/components/TextFieldReset'
import platform from '@/platform'
import { languageAtom } from '@/stores/atoms'
import { Alert, Stack, Typography } from '@mui/material'
import { useAtomValue } from 'jotai'
import { Trans, useTranslation } from 'react-i18next'
import { ModelSettings } from '@/../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '@/components/Accordion'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function LMStudioSetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const language = useAtomValue(languageAtom)
  return (
    <Stack spacing={2}>
      <TextFieldReset
        label={t('api host')}
        value={settingsEdit.lmStudioHost}
        defaultValue="http://127.0.0.1:1234/v1"
        onValueChange={(value) => setSettingsEdit({ ...settingsEdit, lmStudioHost: value })}
        fullWidth
      />
      <Alert icon={false} severity="info">
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
                  />
                ),
              }}
            />
          </p>
        )}
        <p>
          <Trans
            i18nKey="Please ensure that the Remote LM Studio Service is able to connect remotely. For more details, refer to <a>this tutorial</a>."
            components={{
              a: (
                <a
                  className="cursor-pointer font-bold"
                  onClick={() => {
                    platform.openLink(`https://chatboxai.app/redirect_app/lm_studio_guide/${language}`)
                  }}
                />
              ),
            }}
          />
        </p>
      </Alert>
      <LMStudioModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
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
