import { useModelOptionGroups } from '@/hooks/use-model-option-groups'
import { cn } from '@/lib/utils'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { FormControl, InputLabel, Select } from '@mui/material'
import Divider from '@mui/material/Divider'
import ListSubheader from '@mui/material/ListSubheader'
import MenuItem from '@mui/material/MenuItem'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChatboxAIModel, ModelSettings } from '../../../shared/types'
import { ModelSelectProps } from './types'

export const chatboxAIModelLabelHash: Record<ChatboxAIModel, React.ReactNode> = {
  'chatboxai-3.5': (
    <span className="inline-flex items-center">
      <svg
        className="w-4 h-4 mr-1 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z"
        />
      </svg>
      Chatbox AI 3.5
    </span>
  ),
  'chatboxai-4': (
    <span className="inline-flex items-center">
      <svg
        className="w-4 h-4 mr-1 opacity-50"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
        />
      </svg>
      Chatbox AI 4
    </span>
  ),
}

export default function ChatboxAIModelSelect({ settingsEdit, ...props }: ModelSelectProps) {
  const { t } = useTranslation()
  const [expandedGroups, setExpandedGroups] = useState<string[]>([])
  const { optionGroups } = useModelOptionGroups(settingsEdit, [settingsEdit.licenseKey])

  const onClickGroupName = (groupName: string) => {
    if (expandedGroups.includes(groupName)) {
      setExpandedGroups((prev) => prev.filter((name) => name !== groupName))
    } else {
      setExpandedGroups((prev) => [...prev, groupName])
    }
  }

  const horizontal = optionGroups.length > 2 // 选项分组在 3 个以上时，分组内部的选项使用水平布局

  return (
    <FormControl fullWidth={true} variant="outlined" margin="dense" className={props.className}>
      <InputLabel>{t('model')}</InputLabel>
      <Select
        label={t('model')}
        value={settingsEdit.chatboxAIModel || 'chatboxai-3.5'}
        MenuProps={
          horizontal
            ? {
                PaperProps: {
                  style: { maxWidth: '200px' },
                },
              }
            : {}
        }
      >
        {optionGroups
          .map((group, index) => {
            const items: React.ReactNode[] = []
            if (index > 0 && group.group_name) {
              items.push(
                <ListSubheader
                  color="primary"
                  key={`group-${index}-group-name`}
                  sx={{
                    backgroundColor: 'inherit',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                >
                  <span
                    className={cn(
                      'flex flex-row justify-between items-center',
                      'cursor-pointer',
                      'py-1.5',
                      'text-sm',
                      'font-medium',
                      group.collapsable && !expandedGroups.includes(group.group_name ?? '')
                        ? 'opacity-100'
                        : 'opacity-50'
                    )}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClickGroupName(group.group_name ?? '')
                    }}
                  >
                    <span>{group.group_name}</span>
                    {group.collapsable &&
                      (expandedGroups.includes(group.group_name ?? '') ? (
                        <ExpandLessIcon fontSize="small" />
                      ) : (
                        <ExpandMoreIcon fontSize="small" />
                      ))}
                  </span>
                </ListSubheader>
              )
            }
            group.options.forEach((option) => {
              items.push(
                <MenuItem
                  value={option.value}
                  key={`group-${index}-option-${option.value}`}
                  selected={option.value === settingsEdit.chatboxAIModel}
                  onClick={() =>
                    props.setSettingsEdit({
                      ...settingsEdit,
                      chatboxAIModel: option.value as ModelSettings['chatboxAIModel'],
                    })
                  }
                  dense
                  sx={{
                    display:
                      group.collapsable && !expandedGroups.includes(group.group_name ?? '')
                        ? 'none'
                        : horizontal
                        ? 'inline-flex'
                        : '',
                    lineHeight: '1',
                  }}
                >
                  {chatboxAIModelLabelHash[option.value as ChatboxAIModel] || option.label}
                </MenuItem>
              )
            })
            if (index < optionGroups.length - 1) {
              items.push(<Divider key={`group-${index}-divider`} style={{ marginTop: '2px', marginBottom: '2px' }} />)
            }
            return items
          })
          .flat()}
      </Select>
    </FormControl>
  )
}
