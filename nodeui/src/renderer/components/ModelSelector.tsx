import useModelConfig from '@/hooks/useModelConfig'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import { getModelSettingUtil } from '@/packages/model-setting-utils'
import { getSession, saveSession } from '@/stores/session-store'
import { Box, Drawer, Typography, useTheme } from '@mui/material'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import { useAtomValue } from 'jotai'
import { ChevronDown, ChevronRight, ChevronsUpDown } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ModelProvider } from '../../shared/types'
import * as atoms from '../stores/atoms'
import MiniButton from './MiniButton'
import { chatboxAIModelLabelHash } from './model-select/ChatboxAIModelSelect'
import StyledMenu from './StyledMenu'

export function ChatModelSelector(props: {}) {
  const { t } = useTranslation()
  const currentMergedSettings = useAtomValue(atoms.currentMergedSettingsAtom)
  const theme = useTheme()
  const currentSessionId = useAtomValue(atoms.currentSessionIdAtom)

  const { optionGroups, currentOption, refreshWithRemoteOptionGroups } = useModelConfig(currentMergedSettings)

  const modelSettingUtil = getModelSettingUtil(currentMergedSettings.aiProvider)

  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const onClickGroupName = (groupName: string) => {
    if (expandedGroups.includes(groupName)) {
      setExpandedGroups((prev) => prev.filter((name) => name !== groupName))
    } else {
      setExpandedGroups((prev) => [...prev, groupName])
    }
  }

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const handleMenuItemSelect = (option: string) => {
    const currentSession = getSession(currentSessionId)
    if (!currentSession) {
      return
    }
    // currentSession.settigns 需要更新对象指针，以触发 atom 变化
    currentSession.settings = modelSettingUtil.selectSessionModel(currentSession.settings, option)

    saveSession({ ...currentSession })
    handleMenuClose()
  }

  const ITEM_HEIGHT = 48

  useEffect(() => {
    if (open) {
      // 如果菜单打开，则不刷新，以避免刷新时闪动导致的糟糕体验
      return
    }
    refreshWithRemoteOptionGroups()
  }, [open])

  const isSmallScreen = useIsSmallScreen()

  const labelHash = currentMergedSettings.aiProvider === ModelProvider.ChatboxAI ? chatboxAIModelLabelHash : {}

  const optionElements = optionGroups
    .map((group, index) => {
      const items: React.ReactNode[] = []
      const isExpanded = expandedGroups.includes(group.group_name ?? '')
      if (index > 0 && group.group_name) {
        items.push(
          <MenuItem
            key={`group-${index}-group-name`}
            disabled={!group.collapsable}
            dense
            sx={{
              opacity: group.collapsable && !isExpanded ? 1 : 0.5,
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
            onClick={() => onClickGroupName(group.group_name ?? '')}
          >
            <span>{group.group_name}</span>
            {group.collapsable &&
              (isExpanded ? (
                <ChevronDown className="w-4 h-4" strokeWidth={1} />
              ) : (
                <ChevronRight className="w-4 h-4" strokeWidth={1} />
              ))}
          </MenuItem>
        )
      }
      if (!group.collapsable || isExpanded) {
        items.push(
          ...group.options.map((option) => (
            <MenuItem
              key={`group-${index}-option-${option.value}`}
              selected={option.value === currentOption.value}
              onClick={() => handleMenuItemSelect(option.value)}
              dense
            >
              {labelHash[option.value] || option.label}
            </MenuItem>
          ))
        )
      }
      if (index < optionGroups.length - 1) {
        items.push(<Divider key={`group-${index}-divider`} />)
      }
      return items
    })
    .flat()

  return (
    <div>
      {isSmallScreen ? (
        <MiniButton
          className="w-auto flex items-center"
          style={{ color: theme.palette.text.primary }}
          onClick={handleMenuOpen}
        >
          <span className="text-[10px] opacity-70 p-0 m-0">{currentOption.label}</span>
          <ChevronsUpDown size="16" strokeWidth={1} className="opacity-50 p-0 m-0" />
        </MiniButton>
      ) : (
        <MiniButton
          className="mr-2 w-auto flex items-center"
          style={{ color: theme.palette.text.primary }}
          onClick={handleMenuOpen}
        >
          <span className="text-sm opacity-70">{currentOption.label}</span>
          <ChevronsUpDown size="16" strokeWidth={1} className="opacity-50" />
        </MiniButton>
      )}
      {!isSmallScreen ? (
        <StyledMenu
          MenuListProps={{
            'aria-labelledby': '',
          }}
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            style: {
              maxHeight: 'calc(60vh - 96px)',
              marginTop: '0px', // 调整弹出菜单的位置
            },
          }}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'left',
          }}
          transformOrigin={{
            vertical: 'bottom',
            horizontal: 'left',
          }}
          elevation={0}
        >
          {optionElements}
        </StyledMenu>
      ) : (
        <Drawer anchor="bottom" open={open} onClose={handleMenuClose}>
          <Box className="max-h-[85vh] flex flex-col">
            <Typography variant="h6" className="px-4 py-2 text-center">
              {t('Select Model')}
            </Typography>
            <Box className="flex-1 overflow-auto">{optionElements}</Box>
          </Box>
        </Drawer>
      )}
    </div>
  )
}
