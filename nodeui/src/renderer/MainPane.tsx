import { useEffect } from 'react'
import { Box, IconButton, ButtonGroup } from '@mui/material'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp'
import ArrowCircleDownIcon from '@mui/icons-material/ArrowCircleDown'
import * as atoms from './stores/atoms'
import { useAtom, useAtomValue } from 'jotai'
import InputBox from './components/InputBox'
import MessageList from './components/MessageList'
import * as scrollActions from './stores/scrollActions'
import { useIsSmallScreen, useSidebarWidth } from './hooks/useScreenChange'
import Header from './components/Header'

export default function MainPane(props: {}) {
  const language = useAtomValue(atoms.languageAtom)
  const [showSidebar] = useAtom(atoms.showSidebarAtom)
  const currentSessionId = useAtomValue(atoms.currentSessionIdAtom)

  const sidebarWidth = useSidebarWidth()
  const isSmallScreen = useIsSmallScreen()

  useEffect(() => {
    setTimeout(() => {
      scrollActions.scrollToBottom('auto') // 每次启动时自动滚动到底部
    }, 200)
  }, [])

  return (
    <Box
      className="h-full w-full"
      sx={{
        flexGrow: 1,
        ...(showSidebar
          ? language === 'ar'
            ? { marginRight: { sm: `${sidebarWidth}px` } }
            : { marginLeft: { sm: `${sidebarWidth}px` } }
          : {}),
      }}
    >
      <div className="flex flex-col h-full">
        {/* {
                    // 小屏幕的广告UI
                    isSmallScreen && (
                        <Box className="text-center">
                            <SponsorChip />
                        </Box>
                    )
                } */}
        <Header />

        {/* MessageList 设置 key，确保每个 session 对应新的 MessageList 实例 */}
        <MessageList
          key={currentSessionId}
          // className="animate-fade-in transition-opacity duration-500 ease-in-out"
        />

        <ScrollButtons />
        <InputBox />
      </div>
    </Box>
  )
}

function ScrollButtons() {
  const atScrollTop = useAtomValue(atoms.messageScrollingAtTopAtom)
  const atScrollBottom = useAtomValue(atoms.messageScrollingAtBottomAtom)
  const language = useAtomValue(atoms.languageAtom)
  return (
    <Box className="relative">
      <ButtonGroup
        sx={
          language === 'ar'
            ? {
                position: 'absolute',
                left: '0.4rem',
                top: '-5.5rem',
                opacity: 0.6,
              }
            : {
                position: 'absolute',
                right: '0.4rem',
                top: '-5.5rem',
                opacity: 0.6,
              }
        }
        orientation="vertical"
      >
        <IconButton
          onClick={() => scrollActions.scrollToTop()}
          sx={{
            visibility: atScrollTop ? 'hidden' : 'visible',
          }}
        >
          <ArrowCircleUpIcon />
        </IconButton>
        <IconButton
          onClick={() => scrollActions.scrollToBottom()}
          sx={{
            visibility: atScrollBottom ? 'hidden' : 'visible',
          }}
        >
          <ArrowCircleDownIcon />
        </IconButton>
      </ButtonGroup>
    </Box>
  )
}
