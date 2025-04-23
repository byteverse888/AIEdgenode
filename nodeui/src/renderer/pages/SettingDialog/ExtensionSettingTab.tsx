import SimpleSelect from '@/components/SimpleSelect'
import { Box, FormGroup, Link, Stack, TextField, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Settings } from '../../../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '../../components/Accordion'

interface Props {
  settingsEdit: Settings
  setSettingsEdit: (settings: Settings) => void
}

export default function ExtensionSettingTab(props: Props) {
  const { settingsEdit, setSettingsEdit } = props
  const { t } = useTranslation()

  return (
    <Box>
      <Accordion expanded={true}>
        <AccordionSummary aria-controls="panel1a-content">
          <Typography>{t('Web Search')}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormGroup>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {t('Search Provider')}
              </Typography>
              <SimpleSelect
                label={t('Search Provider')}
                value={settingsEdit.extension?.webSearch?.provider ?? 'bing'}
                onChange={(provider) => {
                  setSettingsEdit({
                    ...settingsEdit,
                    extension: {
                      ...settingsEdit.extension,
                      webSearch: {
                        ...settingsEdit.extension?.webSearch,
                        provider,
                        tavilyApiKey:
                          provider === 'tavily' ? settingsEdit.extension?.webSearch?.tavilyApiKey : undefined,
                      },
                    },
                  })
                }}
                options={[
                  { value: 'build-in', label: 'Chatbox' },
                  { value: 'bing', label: 'Bing' },
                  { value: 'tavily', label: 'Tavily' },
                ]}
              />
            </FormGroup>

            {settingsEdit.extension?.webSearch?.provider === 'tavily' && (
              <Stack direction="column" spacing={0}>
                <TextField
                  label={t('Tavily API Key')}
                  value={settingsEdit.extension?.webSearch?.tavilyApiKey ?? ''}
                  onChange={(e) => {
                    setSettingsEdit({
                      ...settingsEdit,
                      extension: {
                        ...settingsEdit.extension,
                        webSearch: {
                          ...settingsEdit.extension?.webSearch,
                          tavilyApiKey: e.target.value,
                        },
                      },
                    })
                  }}
                  type="password"
                  fullWidth
                />
                <Link
                  href="https://app.tavily.com?utm_source=chatbox"
                  target="_blank"
                  rel="noopener"
                  className="text-sm pl-2 cursor-pointer hover:text-blue-600 transition-colors"
                >
                  {t('Get API Key')}
                </Link>
              </Stack>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}
