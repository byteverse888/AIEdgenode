import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Artifact } from '@/components/Artifact'
import { useState } from 'react'

const ArtifactPreview = NiceModal.create(({ htmlCode }: { htmlCode: string }) => {
  const modal = useModal()
  const { t } = useTranslation()
  const [reloadSign, setReloadSign] = useState(0)
  const onReload = () => {
    setReloadSign(Math.random())
  }
  const onClose = () => {
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
      maxWidth="md"
      classes={{ paper: 'h-4/5' }}
    >
      <DialogTitle>{t('Preview')}</DialogTitle>
      <DialogContent style={{ padding: '0', margin: '0' }}>
        <Artifact htmlCode={htmlCode} reloadSign={reloadSign} className="h-[96%]" />
      </DialogContent>
      <DialogActions>
        <Button onClick={onReload}>{t('Refresh')}</Button>
        <Button onClick={onClose}>{t('close')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default ArtifactPreview
