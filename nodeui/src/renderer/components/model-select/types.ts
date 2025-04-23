import type { ModelSettings } from 'src/shared/types'

export interface ModelSelectProps {
  settingsEdit: ModelSettings
  setSettingsEdit: (settings: ModelSettings) => void
  className?: string
}
