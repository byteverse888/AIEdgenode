import { useState, useEffect, useRef } from 'react'
import platform from '../platform'

export default function useVersion() {
  const [version, _setVersion] = useState('')
  const updateCheckTimer = useRef<NodeJS.Timeout>()
  useEffect(() => {
    const handler = async () => {
      const version = await platform.getVersion()
      _setVersion(version)
    }
    handler()
    updateCheckTimer.current = setInterval(handler, 2 * 60 * 60 * 1000)
    return () => {
      if (updateCheckTimer.current) {
        clearInterval(updateCheckTimer.current)
        updateCheckTimer.current = undefined
      }
    }
  }, [])

  return {
    version,
  }
}
