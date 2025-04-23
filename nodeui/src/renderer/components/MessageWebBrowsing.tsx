import { MessageWebBrowsing } from 'src/shared/types'
import { Globe, ExternalLink, ChevronUp, ChevronDown } from 'lucide-react'
import LinkTargetBlank from './Link'
import { useMemo, useState } from 'react'

export default function MessageWebBrowsing(props: { webBrowsing: MessageWebBrowsing }) {
  const { webBrowsing } = props
  if (!webBrowsing.links || webBrowsing.links.length === 0) {
    return null
  }
  return useMemo(() => <WebBrowsingCard {...props} />, [webBrowsing])
}

function WebBrowsingCard(props: { webBrowsing: MessageWebBrowsing }) {
  const { webBrowsing } = props
  const [showAll, setShowAll] = useState(false)
  const DISPLAY_LINKS_COUNT = 4
  const displayLinks = useMemo(() => {
    return showAll ? webBrowsing.links : webBrowsing.links.slice(0, DISPLAY_LINKS_COUNT)
  }, [webBrowsing.links, showAll])
  return (
    <div className="flex flex-col gap-1.5 mt-1.5 p-2 rounded bg-blue-50/80 dark:bg-blue-900/20 border border-blue-300/30 dark:border-blue-600/30">
      <div className="flex flex-col gap-1.5 px-1.5 py-1 text-xs">
        <div className="flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            {webBrowsing.query && webBrowsing.query.length > 0 && (
              <span className="font-medium bg-blue-100/90 dark:bg-blue-500/30 px-2.5 py-1 rounded-full inline-block max-w-full">
                <span className="block truncate">{webBrowsing.query.join(', ')}</span>
              </span>
            )}
          </div>
          {webBrowsing.links.length > DISPLAY_LINKS_COUNT && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="cursor-pointer
                            bg-white dark:bg-blue-500/30
                            hover:bg-blue-50 dark:hover:bg-blue-500/20 
                            text-blue-600 dark:text-blue-400
                            px-2 py-0.5 rounded-full
                            border border-blue-400/30
                            transition-colors flex items-center gap-1.5 flex-shrink-0"
            >
              {showAll ? (
                <ChevronUp size={14} />
              ) : (
                <>
                  <span className="text-xs opacity-80">+{webBrowsing.links.length - DISPLAY_LINKS_COUNT}</span>
                  <ChevronDown size={14} />
                </>
              )}
            </button>
          )}
        </div>
      </div>
      <div className="px-0.5">
        {displayLinks.map((link, index) => (
          <div key={index}>
            <span className="text-xs text-gray-500 dark:text-gray-500">[{index + 1}]</span>
            <LinkTargetBlank
              key={index}
              href={link.url}
              className="text-xs py-0.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded px-1.5"
            >
              <span className="whitespace-pre-wrap flex-1 break-all">{link.title}</span>
              <ExternalLink className="w-2.5 h-2.5 ml-1.5 text-gray-500 flex-shrink-0" />
            </LinkTargetBlank>
          </div>
        ))}
      </div>
    </div>
  )
}
