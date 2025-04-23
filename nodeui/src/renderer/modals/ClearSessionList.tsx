import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { ChangeEvent, useEffect, useState } from 'react'
import { Input, Button, Dialog, DialogContent, DialogActions, DialogTitle, DialogContentText } from '@mui/material'
import { useTranslation, Trans } from 'react-i18next'
import * as sessionActions from '../stores/sessionActions'
import { trackingEvent } from '@/packages/event'

const ClearSessionList = NiceModal.create(() => {
  const modal = useModal()
  const { t } = useTranslation()
  const [value, setValue] = useState(100)
  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    const int = parseInt(event.target.value || '0')
    if (int >= 0) {
      setValue(int)
    }
  }

  useEffect(() => {
    trackingEvent('clear_conversation_list_window', { event_category: 'screen_view' })
  }, [])

  const clean = () => {
    sessionActions.clearConversationList(value)
    trackingEvent('clear_conversation_list', { event_category: 'user' })
    handleClose()
  }

  const handleClose = () => {
    modal.resolve()
    modal.hide()
  }

  return (
    <Dialog
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.resolve()
        modal.hide()
      }}
    >
      <DialogTitle>{t('Clear Conversation List')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Trans
            i18nKey="Keep only the Top N Conversations in List and Permanently Delete the Rest"
            values={{ n: value }}
            components={[
              <Input
                value={value}
                onChange={handleInput}
                className="w-14"
                inputProps={{ style: { textAlign: 'center' } }}
              />,
            ]}
          />
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('cancel')}</Button>
        <Button onClick={clean} color="error">
          {t('clean it up')}
        </Button>
      </DialogActions>
    </Dialog>
  )
})

export default ClearSessionList
