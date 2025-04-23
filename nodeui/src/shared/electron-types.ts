export interface ElectronIPC {
  invoke: (channel: string, ...args: any[]) => Promise<any>
  onSystemThemeChange: (callback: () => void) => () => void
  onWindowShow: (callback: () => void) => () => void
  onUpdateDownloaded: (callback: () => void) => () => void
}
