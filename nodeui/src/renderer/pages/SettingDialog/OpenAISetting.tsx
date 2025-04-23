import { Alert, Typography, Box, Stack } from '@mui/material'
import { ModelSettings, ModelProvider } from '@/../shared/types'
import { useTranslation, Trans } from 'react-i18next'
import { Accordion, AccordionSummary, AccordionDetails } from '@/components/Accordion'
import TemperatureSlider from '@/components/TemperatureSlider'
import TopPSlider from '@/components/TopPSlider'
import PasswordTextField from '@/components/PasswordTextField'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import OpenAIModelSelect from '@/components/model-select/OpenAIModelSelect'
// import TokenConfig from './TokenConfig'
import TextFieldReset from '@/components/TextFieldReset'
import { remoteConfigAtom } from '@/stores/atoms'
import { useAtomValue } from 'jotai'

interface ModelConfigProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
}

export default function OpenAISetting(props: ModelConfigProps) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()
  const remoteConfig = useAtomValue(remoteConfigAtom)
  return (
    <Stack spacing={2}>
      <PasswordTextField
        label={t('api key')}
        value={settingsEdit.openaiKey}
        setValue={(value) => {
          setSettingsEdit({ ...settingsEdit, openaiKey: value })
        }}
        placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
      />
      <TextFieldReset
        margin="dense"
        label={t('api host')}
        type="text"
        fullWidth
        variant="outlined"
        value={settingsEdit.apiHost}
        placeholder="https://api.openai.com"
        defaultValue="https://api.openai.com"
        onValueChange={(value) => {
          value = value.trim()
          if (value.length > 4 && !value.startsWith('http')) {
            value = 'https://' + value
          }
          setSettingsEdit({ ...settingsEdit, apiHost: value })
        }}
      />
      {settingsEdit.apiHost !== 'https://api.openai.com' && remoteConfig.setting_chatboxai_first && (
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
      <OpenAIModelSelect settingsEdit={settingsEdit} setSettingsEdit={setSettingsEdit} />
      {/* <FormGroup>
                <FormControlLabel
                    className='px-2 mb-2'
                    control={<Switch size='small' />}
                    label={
                        <Typography variant='body2' className='flex items-center justify-center opacity-50'>
                            {t('Improve Network Compatibility')}
                            <Tooltip
                                title={t('Use proxy to resolve CORS and other network issues')}
                                className="cursor-pointer"
                                placement='top'
                            >
                                <HelpOutlineIcon className='opacity-60 ml-0.5' fontSize='small' />
                            </Tooltip>
                        </Typography>
                    }
                    checked={settingsEdit.openaiUseProxy}
                    onChange={(e, checked) =>
                        setSettingsEdit({
                            ...settingsEdit,
                            openaiUseProxy: checked,
                        })
                    }
                />
            </FormGroup> */}
      <Accordion>
        <AccordionSummary aria-controls="panel1a-content">
          <Typography>{t('Advanced')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TemperatureSlider
            value={settingsEdit.temperature}
            onChange={(value) => setSettingsEdit({ ...settingsEdit, temperature: value })}
          />
          <TopPSlider topP={settingsEdit.topP} setTopP={(v) => setSettingsEdit({ ...settingsEdit, topP: v })} />
          <MaxContextMessageCountSlider
            value={toBeRemoved_getContextMessageCount(
              settingsEdit.openaiMaxContextMessageCount,
              settingsEdit.maxContextMessageCount
            )}
            onChange={(v) => setSettingsEdit({ ...settingsEdit, maxContextMessageCount: v })}
          />

          {/* <TokenConfig
                        settingsEdit={settingsEdit}
                        setSettingsEdit={(updated) => setSettingsEdit({ ...settingsEdit, ...updated })}
                    /> */}
        </AccordionDetails>
      </Accordion>
    </Stack>
  )
}
