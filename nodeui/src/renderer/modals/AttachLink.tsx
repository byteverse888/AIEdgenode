import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import { TextField, Button, Dialog, DialogContent, DialogActions, DialogTitle } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { useState } from 'react'
import _ from 'lodash'

const AttachLink = NiceModal.create(() => {
  const modal = useModal()
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const onClose = () => {
    modal.resolve([])
    modal.hide()
  }
  const onSubmit = () => {
    const raw = input.trim()
    const urls = raw
      .split(/\s+/)
      .map((url) => url.trim())
      .map((url) => (url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`))
    modal.resolve(urls)
    modal.hide()
  }
  const onInput = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setInput(e.target.value)
  }
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const ctrlOrCmd = event.ctrlKey || event.metaKey
    // ctrl + enter 提交
    if (event.keyCode === 13 && ctrlOrCmd) {
      event.preventDefault()
      onSubmit()
      return
    }
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
      <DialogTitle>{t('Attach Link')}</DialogTitle>
      <DialogContent>
        <TextField
          className="w-full"
          autoFocus
          multiline // multiline 需要和 maxRows 一起使用，否则长文本可能会导致退出编辑？
          minRows={5}
          maxRows={15}
          placeholder={`https://example.com\nhttps://example.com/page`}
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('cancel')}</Button>
        <Button onClick={onSubmit}>{t('submit')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default AttachLink
