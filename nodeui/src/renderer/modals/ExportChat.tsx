import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { useState } from 'react'
import {
  Button,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material'
import { useTranslation } from 'react-i18next'
import * as sessionActions from '@/stores/sessionActions'
import { ExportChatFormat, ExportChatScope } from '@/../shared/types'

const ExportChat = NiceModal.create(() => {
  const modal = useModal()
  const { t } = useTranslation()
  const [scope, setScope] = useState<ExportChatScope>('all_threads')
  const [format, setFormat] = useState<ExportChatFormat>('HTML')

  const onCancel = () => {
    modal.resolve()
    modal.hide()
  }
  const onExport = () => {
    sessionActions.exportCurrentSessionChat(scope, format)
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
      fullWidth
    >
      <DialogTitle>{t('Export Chat')}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth variant="outlined" margin="dense">
          <InputLabel>{t('Scope')}</InputLabel>
          <Select
            labelId="select-export-Scope"
            value={scope}
            label={t('Scope')}
            onChange={(event) => {
              setScope(event.target.value as any)
            }}
          >
            {['all_threads', 'current_thread'].map((scope) => (
              <MenuItem key={scope} value={scope}>
                {t((scope.charAt(0).toUpperCase() + scope.slice(1).toLowerCase()).split('_').join(' '))}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth variant="outlined" margin="dense">
          <InputLabel>{t('Format')}</InputLabel>
          <Select
            labelId="select-export-format"
            value={format}
            label={t('Format')}
            onChange={(event) => {
              setFormat(event.target.value as any)
            }}
          >
            {['HTML', 'TXT', 'Markdown'].map((format) => (
              <MenuItem key={format} value={format}>
                {format}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button onClick={onExport}>{t('export')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default ExportChat
