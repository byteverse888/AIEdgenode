import React, { useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { ListItemText, MenuItem, Avatar, IconButton, Typography, ListItemIcon, useTheme } from '@mui/material'
import { Session } from '../../shared/types'
import CopyIcon from '@mui/icons-material/CopyAll'
import EditIcon from '@mui/icons-material/Edit'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined'
import StyledMenu from './StyledMenu'
import { useTranslation } from 'react-i18next'
import StarIcon from '@mui/icons-material/Star'
import StarOutlineIcon from '@mui/icons-material/StarOutline'
import * as sessionActions from '../stores/sessionActions'
import * as atoms from '@/stores/atoms'
import { cn } from '@/lib/utils'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import VrpanoIcon from '@mui/icons-material/Vrpano'
import { ImageInStorage } from '@/components/Image'
import { ConfirmDeleteMenuItem } from './ConfirmDeleteButton'
import { useNavigate } from '@tanstack/react-router'
import NiceModal from '@ebay/nice-modal-react'
import { saveSession, removeSession } from '@/stores/session-store'

export interface Props {
  session: Session
  selected: boolean
}

function _SessionItem(props: Props) {
  const { session, selected } = props
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation()
    event.preventDefault()
    setAnchorEl(event.currentTarget)
  }
  const handleMenuClose = () => {
    setAnchorEl(null)
  }
  const onClick = () => {
    sessionActions.switchCurrentSession(session.id)
  }
  const theme = useTheme()
  const medianSize = theme.typography.pxToRem(24)
  const isSmallScreen = useIsSmallScreen()
  // const smallSize = theme.typography.pxToRem(20)
  return (
    <>
      <MenuItem
        key={session.id}
        selected={selected}
        onClick={onClick}
        sx={{ padding: '0.1rem', margin: '0.1rem' }}
        className="group/session-item"
      >
        <ListItemIcon>
          <IconButton onClick={onClick}>
            {session.assistantAvatarKey ? (
              <Avatar
                sizes={medianSize}
                sx={{
                  width: medianSize,
                  height: medianSize,
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                <ImageInStorage
                  storageKey={session.assistantAvatarKey}
                  className="object-cover object-center w-full h-full"
                />
              </Avatar>
            ) : session.picUrl ? (
              <Avatar sizes={medianSize} sx={{ width: medianSize, height: medianSize }} src={session.picUrl} />
            ) : session.type === 'picture' ? (
              <VrpanoIcon fontSize="small" />
            ) : (
              <ChatBubbleOutlineOutlinedIcon fontSize="small" />
            )}
          </IconButton>
        </ListItemIcon>
        <ListItemText>
          <Typography variant="inherit" noWrap>
            {session.name}
          </Typography>
        </ListItemText>
        <span
          className={cn(
            session.starred || anchorEl || isSmallScreen ? 'inline-flex' : 'hidden group-hover/session-item:inline-flex'
          )}
        >
          <IconButton onClick={handleMenuClick} sx={{ color: 'primary.main' }}>
            {session.starred ? <StarIcon fontSize="small" /> : <MoreHorizOutlinedIcon fontSize="small" />}
          </IconButton>
        </span>
      </MenuItem>
      <StyledMenu
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
      >
        <MenuItem
          key={session.id + 'edit'}
          onClick={() => {
            NiceModal.show('session-settings', {
              chatConfigDialogSessionId: session.id,
            })
            handleMenuClose()
          }}
          disableRipple
        >
          <EditIcon fontSize="small" />
          {t('edit')}
        </MenuItem>

        <MenuItem
          key={session.id + 'copy'}
          onClick={() => {
            sessionActions.copy(session)
            handleMenuClose()
          }}
          disableRipple
        >
          <CopyIcon fontSize="small" />
          {t('copy')}
        </MenuItem>
        <MenuItem
          key={session.id + 'star'}
          onClick={() => {
            saveSession({
              id: session.id,
              starred: !session.starred,
            })
            handleMenuClose()
          }}
          disableRipple
          divider
        >
          {session.starred ? (
            <>
              <StarOutlineIcon fontSize="small" />
              {t('unstar')}
            </>
          ) : (
            <>
              <StarIcon fontSize="small" />
              {t('star')}
            </>
          )}
        </MenuItem>

        <ConfirmDeleteMenuItem
          onDelete={() => {
            setAnchorEl(null)
            handleMenuClose()
            removeSession(session.id)
          }}
        />
      </StyledMenu>
    </>
  )
}

export default function Session(props: Props) {
  return useMemo(() => {
    return <_SessionItem {...props} />
  }, [props.session, props.selected])
}
