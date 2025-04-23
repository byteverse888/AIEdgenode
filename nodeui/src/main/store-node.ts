import log from 'electron-log'
import Store from 'electron-store'
import { Config, Settings } from '../shared/types'
import * as defaults from '../shared/defaults'
import path from 'path'
import { app } from 'electron'
import * as fs from 'fs-extra'
import { powerMonitor } from 'electron'
import sanitizeFilename from 'sanitize-filename'

const configPath = path.resolve(app.getPath('userData'), 'config.json')

// 1) 检查配置文件是否合法
// 如果配置文件不合法，则使用最新的备份文件
if (fs.existsSync(configPath) && !checkConfigValid(configPath)) {
  log.error('store-node: config.json is invalid.')
  const backups = getBackups()
  if (backups.length > 0) {
    // 不断尝试使用最新的备份文件，直到成功
    for (let i = backups.length - 1; i >= 0; i--) {
      const backup = backups[i]
      if (checkConfigValid(backup.filepath)) {
        fs.copySync(backup.filepath, configPath)
        log.info('store-node: use backup:', backup.filepath)
        break
      }
    }
  }
}

// 2) 初始化store
interface StoreType {
  settings: Settings
  configs: Config
  lastShownAboutDialogVersion: string // 上次启动时自动弹出关于对话框的应用版本
}
export const store = new Store<StoreType>({
  clearInvalidConfig: true, // 当配置JSON不合法时，清空配置
})
log.info('store-node: init store, config path:', store.path)

// 3) 启动自动备份，每10分钟备份一次，并自动清理多余的备份文件
autoBackup()
let autoBackupTimer = setInterval(autoBackup, 10 * 60 * 1000)
powerMonitor.on('resume', () => {
  clearInterval(autoBackupTimer)
  autoBackupTimer = setInterval(autoBackup, 10 * 60 * 1000)
})
powerMonitor.on('suspend', () => {
  clearInterval(autoBackupTimer)
})
async function autoBackup() {
  try {
    if (needBackup()) {
      const filename = await backup()
      if (filename) {
        log.info('store-node: auto backup:', filename)
      }
    }
    await clearBackups()
  } catch (err) {
    log.error('store-node: auto backup error:', err)
  }
}

export function getSettings(): Settings {
  const settings = store.get<'settings'>('settings', defaults.settings())
  return settings
}

export function getConfig(): Config {
  let configs = store.get<'configs'>('configs')
  if (!configs) {
    configs = defaults.newConfigs()
    store.set<'configs'>('configs', configs)
  }
  return configs
}

/**
 * 备份配置文件
 */
export async function backup() {
  if (!fs.existsSync(configPath)) {
    log.error('store-node: skip backup because config.json does not exist.')
    return
  }
  if (!checkConfigValid(configPath)) {
    log.error('store-node: skip backup because config.json is invalid.')
    return
  }
  let now = new Date().toISOString().replace(/:/g, '_')
  const backupPath = path.resolve(app.getPath('userData'), `config-backup-${now}.json`)
  try {
    await fs.copy(configPath, backupPath)
  } catch (err) {
    log.error('store-node: Failed to backup config:', err)
    return
  }
  log.info('store-node: backup config to:', backupPath)
  return backupPath
}

/**
 * 获取所有备份文件，并按照时间排序
 * @returns 备份文件信息
 */
export function getBackups() {
  const filenames = fs.readdirSync(app.getPath('userData'))
  const backupFilenames = filenames.filter((filename) => filename.startsWith('config-backup-'))
  if (backupFilenames.length === 0) {
    return []
  }
  let backupFileInfos = backupFilenames.map((filename) => {
    let dateStr = filename.replace('config-backup-', '').replace('.json', '')
    dateStr = dateStr.replace(/_/g, ':')
    const date = new Date(dateStr)
    return {
      filename,
      filepath: path.resolve(app.getPath('userData'), filename),
      dateMs: date.getTime() || 0,
    }
  })
  backupFileInfos = backupFileInfos.sort((a, b) => a.dateMs - b.dateMs)
  return backupFileInfos
}

/**
 * 检查是否需要备份
 * @returns 是否需要备份
 */
export function needBackup() {
  const backups = getBackups()
  if (backups.length === 0) {
    return true
  }
  const lastBackup = backups[backups.length - 1]
  return lastBackup.dateMs < Date.now() - 10 * 60 * 1000 // 10分钟备份一次
}

/**
 * 清理备份文件，仅保留最近50个备份
 */
export async function clearBackups() {
  const limit = 50
  const backups = getBackups()
  if (backups.length < limit) {
    return
  }
  const needDelete = backups.slice(0, backups.length - limit)
  try {
    await Promise.all(
      needDelete.map(async (backup) => {
        await fs.remove(backup.filepath)
        log.info('store-node: clear backup:', backup.filename)
      })
    )
  } catch (err) {
    log.error('store-node: Failed to clear backups:', err)
  }
}

/**
 * 检查配置文件是否是合法的JSON文件
 * @returns 配置文件是否合法
 */
function checkConfigValid(filepath: string) {
  try {
    JSON.parse(fs.readFileSync(filepath, 'utf8'))
  } catch (err) {
    return false
  }
  return true
}

export async function getStoreBlob(key: string) {
  const filename = path.resolve(app.getPath('userData'), 'chatbox-blobs', sanitizeFilename(key))
  const exists = await fs.pathExists(filename)
  if (!exists) {
    return null
  }
  return fs.readFile(filename, { encoding: 'utf-8' })
}

export async function setStoreBlob(key: string, value: string) {
  const filename = path.resolve(app.getPath('userData'), 'chatbox-blobs', sanitizeFilename(key))
  await fs.ensureDir(path.dirname(filename))
  return fs.writeFile(filename, value, { encoding: 'utf-8' })
}

export async function delStoreBlob(key: string) {
  const filename = path.resolve(app.getPath('userData'), 'chatbox-blobs', sanitizeFilename(key))
  const exists = await fs.pathExists(filename)
  if (!exists) {
    return
  }
  await fs.remove(filename)
}

export async function listStoreBlobKeys() {
  const dir = path.resolve(app.getPath('userData'), 'chatbox-blobs')
  const exists = await fs.pathExists(dir)
  if (!exists) {
    return []
  }
  return fs.readdir(dir)
}
