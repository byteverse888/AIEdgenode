import { useEffect } from 'react'
import { Box, IconButton, Typography, Chip, Tooltip, useTheme } from '@mui/material'
import { isChatSession, isPictureSession } from '../../shared/types'
import { useTranslation } from 'react-i18next'
import * as atoms from '../stores/atoms'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import * as sessionActions from '../stores/sessionActions'
import ImageIcon from '@mui/icons-material/Image'
import Toolbar from './Toolbar'
import { useIsSmallScreen } from '../hooks/useScreenChange'
import { PanelRightClose } from 'lucide-react'
import { cn } from '@/lib/utils'
import EditIcon from '@mui/icons-material/Edit'
import * as settingActions from '../stores/settingActions'
import NiceModal from '@ebay/nice-modal-react'

interface Props {}

export default function Header(props: Props) {
  const { t } = useTranslation()
  const theme = useTheme()
  const currentSession = useAtomValue(atoms.currentSessionAtom)
  const [showSidebar, setShowSidebar] = useAtom(atoms.showSidebarAtom)

  const isSmallScreen = useIsSmallScreen()

  // 会话名称自动生成
  useEffect(() => {
    const autoGenerateTitle = settingActions.getAutoGenerateTitle()
    if (!autoGenerateTitle) {
      return
    }
    if (currentSession.name === 'Untitled' && currentSession.messages.length >= 2) {
      sessionActions.generateNameAndThreadName(currentSession.id)
      return // 生成了会话名称，就不再生成 thread 名称
    }
    if (!currentSession.threadName && currentSession.messages.length >= 2) {
      sessionActions.generateThreadName(currentSession.id)
    }
  }, [currentSession.messages.length])

  const editCurrentSession = () => {
    NiceModal.show('session-settings', { chatConfigDialogSessionId: currentSession.id })
  }

  let EditButton: React.ReactNode | null = null
  if (isChatSession(currentSession) && currentSession.settings) {
    EditButton = (
      <Tooltip title={t('Current conversation configured with specific model settings')} className="cursor-pointer">
        <EditIcon
          className="ml-1 cursor-pointer w-4 h-4 opacity-30"
          fontSize="small"
          style={{ color: theme.palette.warning.main }}
        />
      </Tooltip>
    )
  } else if (isPictureSession(currentSession)) {
    EditButton = (
      <Tooltip
        title={t('The Image Creator plugin has been activated for the current conversation')}
        className="cursor-pointer"
      >
        <Chip
          className="ml-2 cursor-pointer"
          variant="outlined"
          color="secondary"
          size="small"
          icon={<ImageIcon className="cursor-pointer" />}
          label={<span className="cursor-pointer">{t('Image Creator')}</span>}
        />
      </Tooltip>
    )
  } else {
    EditButton = <EditIcon className="ml-1 cursor-pointer w-4 h-4 opacity-30" fontSize="small" />
  }

  return (
    <div
      className={cn('flex flex-row', isSmallScreen ? '' : showSidebar ? 'sm:pl-3 sm:pr-2' : 'pr-2')}
      style={{
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid',
        borderBottomColor: theme.palette.divider,
      }}
    >
      {(!showSidebar || isSmallScreen) && (
        <Box className={cn('px-1', 'pt-3 pb-2')} onClick={() => setShowSidebar(!showSidebar)}>
          <IconButton
            sx={
              isSmallScreen
                ? {
                    borderColor: theme.palette.action.hover,
                    borderStyle: 'solid',
                    borderWidth: 1,
                  }
                : {}
            }
          >
            <PanelRightClose size="20" strokeWidth={1.5} />
          </IconButton>
        </Box>
      )}
      <div className={cn('w-full mx-auto flex flex-row', 'pt-3 pb-2')}>
        <Typography
          variant="h6"
          color="inherit"
          component="div"
          noWrap
          sx={{
            flex: 1,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          className="flex items-center cursor-pointer"
          onClick={() => {
            editCurrentSession()
          }}
        >
          {
            <Typography
              variant="h6"
              noWrap
              className={cn(showSidebar ? 'ml-3' : 'ml-1')}
              sx={{
                maxWidth: isSmallScreen ? '12rem' : '18rem',
              }}
            >
              {currentSession.name}
            </Typography>
          }
          {EditButton}
        </Typography>
        {/* {
                    // 大屏幕的广告UI
                    !isSmallScreen && <SponsorChip />
                } */}
        <Toolbar />
      </div>
    </div>
  )
}
