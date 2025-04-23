import { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, useTheme } from '@mui/material'
import { useTranslation } from 'react-i18next'
import * as sessionAction from '../stores/sessionActions'
import * as scrollActions from '../stores/scrollActions'
import { ScanSearch, Loader2 } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Message as MessageType, Session } from 'src/shared/types'
import { cn } from '@/lib/utils'
import { useAtom } from 'jotai'
import * as atoms from '@/stores/atoms'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import Message from '@/components/Message'
import Mark from '@/components/Mark'
import { getMessageText } from '@/utils/message'
interface Props {}

export default function SearchDialog(props: Props) {
  const isSmallScreen = useIsSmallScreen()
  const [open, setOpen] = useAtom(atoms.openSearchDialogAtom)
  const [mode, setMode] = useState<'command' | 'search-result'>('command')
  const [loading, setLoading] = useState<number | null>(null)
  const [searchInput, _setSearchInput] = useState('')
  const [searchResult, setSearchResult] = useState<Session[]>([])
  const [searchResultMarks, setSearchResultMarks] = useState<string[]>([])
  const theme = useTheme()
  const { t } = useTranslation()
  const ref = useRef<HTMLInputElement>(null)
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        ref.current?.focus()
        ref.current?.select() // 全选
      }, 200) // 延迟200毫秒，等待组件元素挂载完成
    }
  }, [open])
  const onSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget.value
    setMode('command')
    _setSearchInput(input)
  }
  const onSearchClick = (flag: 'current-session' | 'global') => {
    setMode('search-result')
    setLoading(Math.random())
    const needSearchSessions: Session[] =
      flag === 'current-session' ? [sessionAction.getCurrentSession()] : sessionAction.getSortedSessions()

    // TODO: 这里值得优化：多关键词搜索、性能优化
    const safeInput = searchInput.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
    const regexp = new RegExp(safeInput, 'i')
    const result: Session[] = []
    let matchedMessageTotal = 0
    for (const session of needSearchSessions) {
      // 搜索会话的当前主题
      const matchedMessages: MessageType[] = []
      for (let i = session.messages.length - 1; i >= 0; i--) {
        const message = session.messages[i]
        if (regexp.test(getMessageText(message))) {
          matchedMessages.push(message)
        }
      }
      // 搜索会话的历史主题
      if (session.threads) {
        for (let i = session.threads.length - 1; i >= 0; i--) {
          const thread = session.threads[i]
          for (let j = thread.messages.length - 1; j >= 0; j--) {
            const message = thread.messages[j]
            if (regexp.test(getMessageText(message))) {
              matchedMessages.push(message)
            }
          }
        }
      }
      if (matchedMessages.length > 0) {
        result.push({ ...session, messages: matchedMessages })
        matchedMessageTotal += matchedMessages.length
      }
      if (matchedMessageTotal >= 100) {
        break
      }
    }
    // result = result.sort((a, b) => {
    //     return b.messages.length - a.messages.length
    // })
    setSearchResult(result)
    setSearchResultMarks([searchInput])
    setLoading(null)
    ref.current?.select() // 搜索后全选输入框，方便删除回退
  }
  return (
    // 通过显隐的方式控制组件，避免组件重复卸载挂载导致的状态丢失，主要是希望保持搜索结果的选中状态，这样用户体验会好很多
    <Dialog
      style={{ display: open ? 'block' : 'none' }}
      open={true}
      onClose={() => setOpen(false)}
      fullWidth
      maxWidth={mode === 'search-result' ? 'md' : 'sm'}
    >
      <DialogContent sx={{ padding: '0.5rem' }}>
        <Command shouldFilter={false} filter={(value, search) => 1}>
          <CommandInput
            ref={ref}
            autoFocus={!isSmallScreen}
            value={searchInput}
            onInput={onSearchInput}
            className={cn('border-none', 'shadow-none', theme.palette.mode === 'dark' ? 'text-white' : 'text-black')}
            placeholder={t('Type a command or search') + '...'}
          />
          {mode === 'command' && (
            <CommandList>
              <CommandEmpty>{t('No results found')}</CommandEmpty>
              <CommandGroup heading={t('Search')}>
                <CommandItem
                  className={cn(
                    theme.palette.mode === 'dark' ? 'aria-selected:bg-slate-500' : 'aria-selected:bg-slate-100'
                  )}
                  onSelect={() => onSearchClick('current-session')}
                >
                  <ScanSearch className="mr-2 h-4 w-4" />
                  <span>
                    {t('Search in Current Conversation')}
                    {searchInput.length > 0 ? ` "${searchInput}"` : ''}
                  </span>
                </CommandItem>
                <CommandItem
                  className={cn(
                    theme.palette.mode === 'dark' ? 'aria-selected:bg-slate-500' : 'aria-selected:bg-slate-100'
                  )}
                  onSelect={() => onSearchClick('global')}
                >
                  <ScanSearch className="mr-2 h-4 w-4" />
                  <span>
                    {t('Search All Conversations')}
                    {searchInput.length > 0 ? ` "${searchInput}"` : ''}
                  </span>
                </CommandItem>
              </CommandGroup>
              {/* <CommandGroup heading="对话">
                            <CommandItem>
                                <ScanSearch className="mr-2 h-4 w-4" />
                                <span>创建新对话</span>
                            </CommandItem>
                            <CommandItem>
                                <ScanSearch className="mr-2 h-4 w-4" />
                                <span>清空当前对话</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandSeparator />
                        <CommandGroup heading="Settings">
                            <CommandItem>
                                <User className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                                <CommandShortcut>⌘P</CommandShortcut>
                            </CommandItem>
                            <CommandItem>
                                <CreditCard className="mr-2 h-4 w-4" />
                                <span>Billing</span>
                                <CommandShortcut>⌘B</CommandShortcut>
                            </CommandItem>
                            <CommandItem>
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                                <CommandShortcut>⌘S</CommandShortcut>
                            </CommandItem>
                        </CommandGroup> */}
            </CommandList>
          )}
          {mode === 'search-result' && loading && (
            <div className="flex justify-center items-center">
              <Loader2 className="animate-spin" />
            </div>
          )}
          {mode === 'search-result' && !loading && (
            <Mark marks={[searchInput]}>
              <CommandList>
                <CommandEmpty>{t('No results found')}</CommandEmpty>
                {searchResult.map((result, i) => (
                  <CommandGroup
                    key={i}
                    heading={`${t('chat')} "${result.name}":`}
                    className={cn('[&_[cmdk-group-heading]]:font-bold', '[&_[cmdk-group-heading]]:opacity-50')}
                  >
                    {result.messages.map((message, j) => (
                      <CommandItem
                        key={`${i}-${j}`}
                        className={cn(
                          theme.palette.mode === 'dark' ? 'bg-slate-600' : 'bg-slate-50',
                          theme.palette.mode === 'dark' ? 'aria-selected:bg-slate-500' : 'aria-selected:bg-slate-200',
                          'my-1',
                          'cursor-pointer',
                          'bg-opacity-50'
                        )}
                        onSelect={() => {
                          sessionAction.switchCurrentSession(result.id)
                          setTimeout(() => {
                            scrollActions.scrollToMessage(message.id)
                          }, 200)
                          setOpen(false)
                        }}
                      >
                        {/* 下面这个隐藏元素，是为了避免这个问题：
                                                        当搜索结果列表中出现重复的元素（相同的消息），此时键盘上下键选中第二条重复消息，继续按向下键会错误切换到第一条重复消息；并且当选中其中一条消息时，重复的消息同样会有选中的显示样式。
                                                        这些异常都会影响使用。我猜测可能和默认行为是根据元素内容进行判断的，因此加上这个唯一的隐藏元素可以规避问题。 */}
                        <span className="hidden">
                          {result.id}-{message.id}-{i}-{j}
                        </span>
                        <Message
                          id={message.id}
                          key={'msg-' + message.id}
                          sessionId={result.id}
                          sessionType={result.type || 'chat'}
                          msg={message}
                          className="w-full"
                          hiddenButtonGroup
                          small
                          preferCollapsedCodeBlock
                        />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Mark>
          )}
        </Command>
      </DialogContent>
    </Dialog>
  )
}
