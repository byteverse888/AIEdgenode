import React, { useEffect } from 'react'
import { Button, Tabs, Tab, Dialog, DialogContent, DialogActions, DialogTitle, Box } from '@mui/material'
import { Settings, SettingWindowTab, Theme } from '../../../shared/types'
import { useTranslation } from 'react-i18next'
import { useAtom } from 'jotai'
import { settingsAtom } from '../../stores/atoms'
import { switchTheme } from '../../hooks/useAppTheme'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import ChatSettingTab from './ChatSettingTab'
import DisplaySettingTab from './DisplaySettingTab'
import ModelSettingTab from './ModelSettingTab'
import AdvancedSettingTab from './AdvancedSettingTab'
import ExtensionSettingTab from './ExtensionSettingTab'
import SettingsIcon from '@mui/icons-material/Settings'
import { trackingEvent } from '@/packages/event'
import * as atoms from '@/stores/atoms'
import ExtensionIcon from '@mui/icons-material/Extension'
import { useBlocker } from '@tanstack/react-router'
// import { resetTokenConfig } from '../../packages/token_config'

export default function SettingWindow(props: {}) {
  const { t } = useTranslation()
  const [settings, setSettings] = useAtom(settingsAtom)

  const [targetTab, setTargetTab] = useAtom(atoms.openSettingDialogAtom)
  const handleClose = () => {
    setTargetTab(null)
  }

  // 标签页控制
  const [currentTab, setCurrentTab] = React.useState<SettingWindowTab>('ai')
  useEffect(() => {
    if (targetTab) {
      setCurrentTab(targetTab)
    }
  }, [targetTab])
  useEffect(() => {
    if (targetTab) {
      trackingEvent('setting_window', { event_category: 'screen_view' })
    }
  }, [targetTab])

  const [settingsEdit, _setSettingsEdit] = React.useState<Settings>(settings)
  const setSettingsEdit = (updated: Settings) => {
    // 切换模型提供方或模型版本时，需重设 token 配置为默认值
    // if (settingsEdit?.aiProvider !== updated.aiProvider || settingsEdit?.model !== updated.model) {
    // updated = { ...updated, ...resetTokenConfig(updated) }
    // }
    _setSettingsEdit(updated)
  }

  useEffect(() => {
    // 仅更新数据，不触发 token 重置
    _setSettingsEdit(settings)
  }, [settings])

  const { proceed, reset, status } = useBlocker({
    shouldBlockFn: () => settings !== settingsEdit,
    withResolver: true,
    enableBeforeUnload: false,
  })

  const onSave = () => {
    setSettings(settingsEdit)
    handleClose()
    proceed?.()
  }

  const onCancel = () => {
    handleClose()
    setSettingsEdit(settings)
    // need to restore the previous theme
    switchTheme(settings.theme ?? Theme.System)
    proceed?.()
  }

  const changeThemeWithPreview = (newMode: Theme) => {
    setSettingsEdit({ ...settingsEdit, theme: newMode })
    switchTheme(newMode)
  }

  return (
    <>
      <Box>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            marginBottom: '20px',
          }}
        >
          <Tabs
            value={currentTab}
            className="max-w-4xl mx-auto"
            onChange={(_, value) => setCurrentTab(value)}
            variant="scrollable"
            scrollButtons
            allowScrollButtonsMobile
          >
            <Tab
              value="ai"
              label={
                <span className="inline-flex justify-center items-center">
                  <SmartToyOutlinedIcon fontSize="small" style={{ marginRight: 5 }} />
                  <span>{t('model')}</span>
                </span>
              }
            />
            <Tab
              value="display"
              label={
                <span className="inline-flex justify-center items-center">
                  <SettingsBrightnessIcon fontSize="small" style={{ marginRight: 5 }} />
                  <span>{t('display')}</span>
                </span>
              }
            />
            <Tab
              value="chat"
              label={
                <span className="inline-flex justify-center items-center">
                  <ChatOutlinedIcon fontSize="small" style={{ marginRight: 5 }} />
                  <span>{t('chat')}</span>
                </span>
              }
            />
            <Tab
              value="advanced"
              label={
                <span className="inline-flex justify-center items-center">
                  <SettingsIcon fontSize="small" style={{ marginRight: 5 }} />
                  <span>{t('advanced')}</span>
                </span>
              }
            />
            <Tab
              value="extension"
              label={
                <span className="inline-flex justify-center items-center">
                  <ExtensionIcon fontSize="small" style={{ marginRight: 5 }} />
                  <span>{t('extension')}</span>
                </span>
              }
            />
            {/* <Tab label={t('premium')} value='premium' /> */}
          </Tabs>
        </Box>

        <Box className="max-w-4xl mx-auto px-5 pb-5">
          {currentTab === 'ai' && (
            <ModelSettingTab
              settingsEdit={settingsEdit}
              setSettingsEdit={(updated) => {
                setSettingsEdit({ ...settingsEdit, ...updated })
              }}
            />
          )}

          {currentTab === 'display' && (
            <DisplaySettingTab
              settingsEdit={settingsEdit}
              setSettingsEdit={(updated) => {
                setSettingsEdit({ ...settingsEdit, ...updated })
              }}
              changeModeWithPreview={changeThemeWithPreview}
            />
          )}

          {currentTab === 'chat' && (
            <ChatSettingTab
              settingsEdit={settingsEdit}
              setSettingsEdit={(updated) => {
                setSettingsEdit({ ...settingsEdit, ...updated })
              }}
            />
          )}

          {currentTab === 'advanced' && (
            <AdvancedSettingTab
              settingsEdit={settingsEdit}
              setSettingsEdit={(updated) => {
                setSettingsEdit({ ...settingsEdit, ...updated })
              }}
              onCancel={onCancel}
            />
          )}

          {currentTab === 'extension' && (
            <ExtensionSettingTab
              settingsEdit={settingsEdit}
              setSettingsEdit={(updated) => {
                setSettingsEdit({ ...settingsEdit, ...updated })
              }}
            />
          )}
        </Box>

        <Box className="max-w-4xl mx-auto" sx={{ padding: '0 20px 20px', display: 'flex', justifyContent: 'flex-end' }}>
          {/* <Button onClick={onCancel}>{t('cancel')}</Button> */}
          <Button
            variant="contained"
            size="large"
            disabled={settings === settingsEdit}
            sx={{ minWidth: 120 }}
            onClick={onSave}
          >
            {t('save')}
          </Button>
        </Box>
      </Box>

      <Dialog open={status === 'blocked'} closeAfterTransition onClose={reset}>
        <DialogTitle>{t('Unsaved settings')}</DialogTitle>
        <DialogContent>{t('You have unsaved settings. Are you sure you want to leave?')}</DialogContent>
        <DialogActions>
          <Button onClick={reset}>{t('No')}</Button>
          <Button onClick={proceed}>{t('Yes')}</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
