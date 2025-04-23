import NiceModal from '@ebay/nice-modal-react'
import Welcome from './Welcome'
import ProviderSelector from './ProviderSelector'
import SessionSettings from './SessionSettings'
import AppStoreRating from './AppStoreRating'
import ArtifactPreview from './ArtifactPreview'
import ClearSessionList from './ClearSessionList'
import ExportChat from './ExportChat'
import MessageEdit from './MessageEdit'
import AttachLink from './AttachLink'
import ReportContent from './ReportContent'

NiceModal.register('welcome', Welcome)
NiceModal.register('provider-selector', ProviderSelector)
NiceModal.register('session-settings', SessionSettings)
NiceModal.register('app-store-rating', AppStoreRating)
NiceModal.register('artifact-preview', ArtifactPreview)
NiceModal.register('clear-session-list', ClearSessionList)
NiceModal.register('export-chat', ExportChat)
NiceModal.register('message-edit', MessageEdit)
NiceModal.register('attach-link', AttachLink)
NiceModal.register('report-content', ReportContent)
