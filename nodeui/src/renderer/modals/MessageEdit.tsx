import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import {
  Typography,
  TextField,
  SelectChangeEvent,
  Avatar,
  MenuItem,
  Select,
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import { MessageRoleEnum, MessageRole, Message } from '@/../shared/types'
import * as sessionActions from '@/stores/sessionActions'
import PersonIcon from '@mui/icons-material/Person'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import SettingsIcon from '@mui/icons-material/Settings'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import { useCallback, useState } from 'react'
import { getMessageText } from '@/utils/message'
const MessageEdit = NiceModal.create((props: { sessionId: string; msg: Message }) => {
  const modal = useModal()
  const { t } = useTranslation()
  const isSmallScreen = useIsSmallScreen()
  // const [data, setData] = useAtom(atoms.messageEditDialogShowAtom)
  const [sessionId] = useState(props.sessionId)
  const [msg, _setMsg] = useState<Message>({ ...props.msg })
  const setMsg = useCallback((m: Partial<Message>) => {
    _setMsg((_m) => ({ ..._m, ...m }))
  }, [])

  const onClose = () => {
    modal.resolve()
    modal.hide()
  }

  const onSave = () => {
    if (!msg || !sessionId) {
      return
    }
    sessionActions.modifyMessage(sessionId, msg, true)
    onClose()
  }
  const onSaveAndReply = () => {
    if (!msg || !sessionId) {
      return
    }
    onSave()
    sessionActions.generateMoreInNewFork(sessionId, msg.id)
  }

  const onRoleSelect = (e: SelectChangeEvent) => {
    if (!msg || !sessionId) {
      return
    }
    setMsg({
      role: e.target.value as MessageRole,
    })
  }
  const onContentInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (!msg || !sessionId) {
      return
    }
    setMsg({
      contentParts: [{ type: 'text', text: e.target.value }], // FIXME: 这里需要考虑其他parts被覆盖的情况
    })
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!msg || !sessionId) {
      return
    }
    const ctrlOrCmd = event.ctrlKey || event.metaKey
    const shift = event.shiftKey

    // ctrl + shift + enter 保存并生成
    if (event.keyCode === 13 && ctrlOrCmd && shift) {
      event.preventDefault()
      onSaveAndReply()
      return
    }
    // ctrl + enter 保存
    if (event.keyCode === 13 && ctrlOrCmd && !shift) {
      event.preventDefault()
      onSave()
      return
    }
  }

  if (!msg || !sessionId) {
    return null
  }

  return (
    <Dialog
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.resolve()
        modal.hide()
      }}
    >
      <DialogTitle></DialogTitle>
      <DialogContent>
        <Select value={msg.role} onChange={onRoleSelect} size="small" id={msg.id + 'select'} className="mb-2">
          <MenuItem value={MessageRoleEnum.System}>
            <Avatar>
              <SettingsIcon />
            </Avatar>
          </MenuItem>
          <MenuItem value={MessageRoleEnum.User}>
            <Avatar>
              <PersonIcon />
            </Avatar>
          </MenuItem>
          <MenuItem value={MessageRoleEnum.Assistant}>
            <Avatar>
              <SmartToyIcon />
            </Avatar>
          </MenuItem>
        </Select>
        <TextField
          className="w-full"
          autoFocus={!isSmallScreen}
          multiline // multiline 需要和 maxRows 一起使用，否则长文本可能会导致退出编辑？
          minRows={5}
          maxRows={15}
          placeholder="prompt"
          value={getMessageText(msg)}
          onChange={onContentInput}
          id={msg.id + 'input'}
          onKeyDown={onKeyDown}
        />
        {!isSmallScreen && (
          <Typography variant="caption" style={{ opacity: 0.3 }}>
            {t('[Ctrl+Enter] Save, [Ctrl+Shift+Enter] Save and Resend')}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onSaveAndReply}>{t('Save & Resend')}</Button>
        <Button onClick={onSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default MessageEdit
