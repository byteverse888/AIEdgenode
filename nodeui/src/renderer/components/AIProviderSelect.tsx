import { Chip, MenuItem, Typography, Box, Alert } from '@mui/material'
import { CustomProvider, ModelProvider, ModelSettings } from '../../shared/types'
import { Trans, useTranslation } from 'react-i18next'
import { AIModelProviderMenuOptionList } from '../packages/models'
import * as React from 'react'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import StyledMenu from './StyledMenu'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DashboardCustomizeIcon from '@mui/icons-material/DashboardCustomize'
import StarIcon from '@mui/icons-material/Star'
import { useAtom } from 'jotai'
import { settingsAtom } from '@/stores/atoms'

interface ModelConfigProps {
  aiProvider: ModelProvider
  onSwitchAIProvider: (provider: ModelProvider) => void
  selectedCustomProviderId?: string
  onSwitchCustomProvider: (providerId: string) => void
  className?: string
  hideCustomProviderManage?: boolean
}

export default function AIProviderSelect(props: ModelConfigProps) {
  const { aiProvider, onSwitchAIProvider, selectedCustomProviderId, onSwitchCustomProvider, hideCustomProviderManage } =
    props
  const { t } = useTranslation()

  const [globalSettings, setGlobalSettings] = useAtom(settingsAtom)

  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null)
  const menuState = Boolean(menuAnchorEl)
  const openMenu = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget)
  }
  const closeMenu = () => {
    setMenuAnchorEl(null)
  }

  // 创建自定义模型（作用于全局）
  const createCustomProvider = () => {
    const newCustomProvider: CustomProvider = {
      id: `custom-provider-${Date.now()}`,
      name: t('Untitled'),
      api: 'openai',
      host: 'https://api.openai.com/v1',
      path: '/chat/completions',
      key: '',
      model: 'gpt-4o',
    }
    setGlobalSettings({
      ...globalSettings,
      aiProvider: ModelProvider.Custom,
      selectedCustomProviderId: newCustomProvider.id,
      customProviders: [newCustomProvider, ...globalSettings.customProviders],
    })
    closeMenu()
  }

  // 删除自定义模型（作用于全局）
  const deleteCustomProvider = (providerId: string) => {
    const customProviders = globalSettings.customProviders.filter((provider) => provider.id !== providerId)
    if (customProviders.length > 0) {
      setGlobalSettings({
        ...globalSettings,
        customProviders,
        selectedCustomProviderId: customProviders[0].id,
      })
      return
    } else {
      setGlobalSettings({
        ...globalSettings,
        customProviders,
        selectedCustomProviderId: undefined,
        aiProvider: ModelProvider.ChatboxAI,
      })
    }
  }

  // 复制自定义模型（作用于全局）
  const copyCustomProvider = (providerId: string) => {
    const customProvider = globalSettings.customProviders.find((provider) => provider.id === providerId)
    if (!customProvider) {
      return
    }
    const newCustomProvider: CustomProvider = {
      ...customProvider,
      id: `custom-provider-${Date.now()}`,
      name: `${customProvider.name} (copy)`,
    }
    setGlobalSettings({
      ...globalSettings,
      customProviders: [newCustomProvider, ...globalSettings.customProviders],
      selectedCustomProviderId: newCustomProvider.id,
    })
  }

  const AddProviderMenuItem = (
    <MenuItem disableRipple onClick={createCustomProvider}>
      <AddCircleOutlineIcon />
      {t('Add Custom Provider')}
    </MenuItem>
  )

  return (
    <>
      <Typography variant="caption" className="opacity-50">
        {t('Model Provider')}:
      </Typography>
      <div className="flex items-end justify-between">
        <Button variant="contained" disableElevation onClick={openMenu} endIcon={<KeyboardArrowDownIcon />}>
          <Typography className="text-left" maxWidth={200} noWrap>
            {aiProvider === ModelProvider.Custom
              ? globalSettings.customProviders.find((provider) => provider.id === selectedCustomProviderId)?.name ||
                t('Untitled')
              : AIModelProviderMenuOptionList.find((provider) => provider.value === aiProvider)?.label || 'Unknown'}
          </Typography>
        </Button>
        {aiProvider === ModelProvider.Custom && !hideCustomProviderManage && (
          <Box className="inline-flex opacity-50 hover:opacity-100">
            <Button
              size="small"
              variant="outlined"
              sx={{ marginRight: '6px' }}
              onClick={() => copyCustomProvider(selectedCustomProviderId || '')}
            >
              {t('copy')}
            </Button>
            <Button
              size="small"
              variant="outlined"
              sx={{ marginRight: '6px' }}
              onClick={() => deleteCustomProvider(selectedCustomProviderId || '')}
              color="error"
            >
              {t('delete')}
            </Button>
          </Box>
        )}
        <StyledMenu
          anchorEl={menuAnchorEl}
          open={menuState}
          onClose={closeMenu}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          PaperProps={{
            style: {
              maxHeight: 'calc(60vh - 96px)',
            },
          }}
        >
          {globalSettings.customProviders.length > 0 && (
            <div>
              {globalSettings.customProviders.map((provider, index) => (
                <MenuItem
                  key={index}
                  disableRipple
                  onClick={() => {
                    onSwitchCustomProvider(provider.id)
                    closeMenu()
                  }}
                >
                  <DashboardCustomizeIcon />
                  {provider.name || t('Untitled')}
                </MenuItem>
              ))}
              {AddProviderMenuItem}
              <Divider sx={{ my: 0.5 }} />
            </div>
          )}
          {AIModelProviderMenuOptionList.map((provider, index) => (
            <MenuItem
              key={index}
              disableRipple
              onClick={() => {
                onSwitchAIProvider(provider.value as ModelProvider)
                closeMenu()
              }}
            >
              <StarIcon />
              {provider.label}
              {provider.featured && (
                <Chip
                  label={t('Easy Access')}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ marginLeft: '10px' }}
                />
              )}
            </MenuItem>
          ))}
          {globalSettings.customProviders.length === 0 && (
            <div>
              <Divider sx={{ my: 0.5 }} />
              {AddProviderMenuItem}
            </div>
          )}
        </StyledMenu>
      </div>
      {aiProvider !== ModelProvider.ChatboxAI &&
        aiProvider !== ModelProvider.Ollama &&
        aiProvider !== ModelProvider.LMStudio &&
        globalSettings.licenseKey &&
        globalSettings.licenseDetail && (
          <Alert severity="warning">
            <Trans
              i18nKey="Your ChatboxAI subscription already includes access to models from various providers. There's no need to switch providers - you can select different models directly within ChatboxAI. Switching from ChatboxAI to other providers will require their respective API keys. <button>Back to ChatboxAI</button>"
              components={{
                button: (
                  <a
                    className="cursor-pointer underline font-bold hover:text-blue-600 transition-colors"
                    onClick={() => {
                      onSwitchAIProvider(ModelProvider.ChatboxAI)
                      closeMenu()
                    }}
                  />
                ),
              }}
            />
          </Alert>
        )}
    </>
  )
}
