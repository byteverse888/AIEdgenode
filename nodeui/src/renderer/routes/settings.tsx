import Page from '@/components/Page'
import SettingWindow from '@/pages/SettingDialog'
import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/settings')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  return (
    <Page title={t('settings')}>
      <SettingWindow />
    </Page>
  )
}
