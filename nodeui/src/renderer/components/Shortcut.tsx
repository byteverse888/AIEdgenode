import { getOS } from '@/packages/navigator'
import { useTranslation } from 'react-i18next'
import { Settings, ShortcutName, ShortcutSetting, shortcutToggleWindowValues } from '../../shared/types'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Select, MenuItem } from '@mui/material'
import { shortcutSendValues } from '../../shared/types'
import WarningIcon from '@mui/icons-material/Warning'

const os = getOS()

function formatKey(key: string) {
  const COMMON_KEY_MAPS: Record<string, string> = {
    ctrl: 'Ctrl',
    command: 'Ctrl',
    mod: 'Ctrl',
    option: 'Alt',
    alt: 'Alt',
    shift: 'Shift',
    enter: '⏎',
    tab: 'Tab',
    up: '↑',
    down: '↓',
    left: '←',
    right: '→',
  }
  const MAC_KEY_MAPS: Record<string, string> = {
    ...COMMON_KEY_MAPS,
    meta: '⌘',
    mod: '⌘',
    command: '⌘',
    option: '⌥',
    alt: '⌥',
    tab: '⇥',
    // shift: '⇧',
  }
  const WINDOWS_KEY_MAPS: Record<string, string> = {
    ...COMMON_KEY_MAPS,
    meta: 'Win',
    // command: 'Win',
  }
  const LINUX_KEY_MAPS: Record<string, string> = {
    ...COMMON_KEY_MAPS,
    meta: 'Super',
    mod: 'Super',
    command: 'Super',
  }
  if (!key) {
    return ''
  }
  const lowercaseKey = key.toLowerCase()
  const keyLabel = key.length === 1 ? key.toUpperCase() : key
  switch (os) {
    case 'Mac':
      return MAC_KEY_MAPS[lowercaseKey] || keyLabel
    case 'Windows':
      return WINDOWS_KEY_MAPS[lowercaseKey] || keyLabel
    case 'Linux':
      return LINUX_KEY_MAPS[lowercaseKey] || keyLabel
    default:
      return COMMON_KEY_MAPS[lowercaseKey] || keyLabel
  }
}

export function Keys(props: {
  keys: string[]
  size?: 'small'
  opacity?: number
  onEdit?: () => void
  className?: string
}) {
  // const sizeClass = props.size === 'small' ? 'text-[0.55rem]' : 'text-sm'
  const sizeClass = 'text-xs'
  const opacityClass = props.opacity !== undefined ? `opacity-${props.opacity * 100}` : ''
  return (
    <span
      className={`inline-block px-1 font-mono whitespace-nowrap ${sizeClass} ${opacityClass} ${props.className || ''}`}
    >
      {props.keys.map((key, index) => (
        <Key key={index}>{formatKey(key)}</Key>
      ))}
    </span>
  )
}

function Key(props: { children: React.ReactNode }) {
  return (
    <code className="inline-block px-1 mx-[1px] border border-solid border-gray-200 dark:border-gray-700 rounded bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100">
      {props.children}
    </code>
  )
}

type ShortcutDataItem = {
  label: string
  name?: ShortcutName
  keys: ShortcutSetting[ShortcutName]
  options?: string[]
}

export function ShortcutConfig(props: {
  shortcuts: Settings['shortcuts']
  setShortcuts: (shortcuts: Settings['shortcuts']) => void
}) {
  const { shortcuts, setShortcuts } = props
  const { t } = useTranslation()
  const items: ShortcutDataItem[] = [
    {
      label: t('Show/Hide the Application Window'),
      name: 'quickToggle',
      keys: shortcuts.quickToggle,
      options: shortcutToggleWindowValues,
    },
    {
      label: t('Focus on the Input Box'),
      name: 'inputBoxFocus',
      keys: shortcuts.inputBoxFocus,
    },
    {
      label: t('Focus on the Input Box and Enter Web Browsing Mode'),
      name: 'inputBoxWebBrowsingMode',
      keys: shortcuts.inputBoxWebBrowsingMode,
    },
    {
      label: t('Send'),
      name: 'inpubBoxSendMessage',
      keys: shortcuts.inpubBoxSendMessage,
      options: shortcutSendValues,
    },
    // {
    //     label: t('Insert a New Line into the Input Box'),
    //     // name: 'inputBoxInsertNewLine',
    //     keys: shortcuts.inputBoxInsertNewLine,
    // },
    {
      label: t('Send Without Generating Response'),
      name: 'inpubBoxSendMessageWithoutResponse',
      keys: shortcuts.inpubBoxSendMessageWithoutResponse,
      options: shortcutSendValues,
    },
    {
      label: t('Create a New Conversation'),
      name: 'newChat',
      keys: shortcuts.newChat,
    },
    {
      label: t('Create a New Image-Creator Conversation'),
      name: 'newPictureChat',
      keys: shortcuts.newPictureChat,
    },
    {
      label: t('Navigate to the Next Conversation'),
      name: 'sessionListNavNext',
      keys: shortcuts.sessionListNavNext,
    },
    {
      label: t('Navigate to the Previous Conversation'),
      name: 'sessionListNavPrev',
      keys: shortcuts.sessionListNavPrev,
    },
    {
      label: t('Navigate to the Specific Conversation'),
      // name: 'sessionListNavTargetIndex',
      keys: 'mod+1-9',
    },
    {
      label: t('Refresh Context, Start a New Thread'),
      name: 'messageListRefreshContext',
      keys: shortcuts.messageListRefreshContext,
    },
    {
      label: t('Show/Hide the Search Dialog'),
      name: 'dialogOpenSearch',
      keys: shortcuts.dialogOpenSearch,
    },
    {
      label: t('Navigate to the Previous Option (in search dialog)'),
      // name: 'optionNavUp',
      keys: shortcuts.optionNavUp,
    },
    {
      label: t('Navigate to the Next Option (in search dialog)'),
      // name: 'optionNavDown',
      keys: shortcuts.optionNavDown,
    },
    {
      label: t('Select the Current Option (in search dialog)'),
      // name: 'optionSelect',
      keys: shortcuts.optionSelect,
    },
  ]
  const isConflict = (name: ShortcutName, shortcut: string) => {
    for (const item of items) {
      if (item.name && item.name !== name && item.keys === shortcut) {
        return true
      }
    }
    return false
  }
  return (
    <TableContainer component={Paper}>
      {/* <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                <ConfirmDeleteButton
                    onDelete={() => {
                        setShortcuts(defaults.settings().shortcuts)
                    }}
                    icon={<RestartAltIcon />}
                    label={t('Reset All Hotkeys')}
                    color="warning"
                />
            </Box> */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('Action')}</TableCell>
            <TableCell align="center">{t('Hotkeys')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map(({ name, label, keys, options }, itemIndex) => (
            <TableRow key={`${name}-${itemIndex}`}>
              <TableCell>
                <Typography variant="body2" className="text-sm">
                  {label}
                </Typography>
              </TableCell>
              <TableCell align="center">
                {options ? (
                  <Select
                    size="small"
                    value={keys}
                    onChange={(e) => {
                      if (name && setShortcuts) {
                        setShortcuts({
                          ...shortcuts,
                          [name]: e.target.value,
                        })
                      }
                    }}
                    sx={{
                      '.MuiSelect-select': { py: 0.5, px: 4 },
                      minWidth: '120px',
                    }}
                  >
                    {options.map((value) => (
                      <MenuItem dense key={value} value={value} sx={{ py: 0.5, px: 0 }}>
                        <ShortcutText shortcut={value} isConflict={false} />
                      </MenuItem>
                    ))}
                  </Select>
                ) : (
                  <ShortcutText shortcut={keys} isConflict={name ? isConflict(name, keys) : false} />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

function ShortcutText(props: { shortcut: string; isConflict?: boolean; className?: string }) {
  const { shortcut, isConflict, className } = props
  const { t } = useTranslation()
  if (shortcut === '') {
    return <span className={`px-2 py-0.5 text-xs ${className || ''}`}>{t('None')}</span>
  }
  return (
    <span className={`py-0.5 text-xs ${className || ''}`}>
      <Keys keys={shortcut.split('+')} />
      {isConflict && (
        <WarningIcon
          sx={{
            color: 'warning.main',
            fontSize: '16px',
          }}
        />
      )}
    </span>
  )
}
