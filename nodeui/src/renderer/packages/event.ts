import platform from '@/platform'
import { allowReportingAndTrackingAtom } from '@/stores/atoms'
import { getDefaultStore } from 'jotai'

export function trackingEvent(name: string, params: { [key: string]: string } = {}) {
  const store = getDefaultStore()
  const allowReportingAndTracking = store.get(allowReportingAndTrackingAtom)
  if (!allowReportingAndTracking) {
    return
  }
  platform.trackingEvent(name, params)
}
