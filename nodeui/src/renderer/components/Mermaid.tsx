import { useSetAtom } from 'jotai'
import mermaid from 'mermaid'
import { useEffect, useState, useMemo } from 'react'
import * as atoms from '@/stores/atoms'
import { ChartBarStacked } from 'lucide-react'
import { Img } from './Image'
import { copyToClipboard } from '@/packages/navigator'
import { cn } from '@/lib/utils'
import DataObjectIcon from '@mui/icons-material/DataObject'
import * as toastActions from '../stores/toastActions'
import { useTranslation } from 'react-i18next'
import * as picUtils from '@/packages/pic_utils'

export function MessageMermaid(props: { source: string; theme: 'light' | 'dark'; generating?: boolean }) {
  const { source, theme, generating } = props

  const [svgId, setSvgId] = useState('')
  const [svgCode, setSvgCode] = useState('')
  useEffect(() => {
    if (generating) {
      return
    }
    ;(async () => {
      const { id, svg } = await mermaidCodeToSvgCode(source, theme)
      setSvgCode(svg)
      setSvgId(id)
    })()
  }, [source, theme, generating])

  if (generating) {
    // 测试下来，发现这种方法是视觉效果最好的。
    // 如果根据 mermaid 是否正常渲染来判断，有时候残缺的 mermaid 也可以渲染出部分图形，这会造成视觉上的闪屏混乱。
    return <Loading />
  }

  return (
    // <SVGPreview xmlCode={svgCode} />
    <MermaidSVGPreviewDangerous svgId={svgId} svgCode={svgCode} mermaidCode={source} />
  )
}

export function Loading() {
  return (
    <div className="inline-flex items-center gap-2 border border-solid border-gray-500 rounded-md p-2 my-2">
      <ChartBarStacked size={30} strokeWidth={1} />
      <span>Loading...</span>
    </div>
  )
}

/**
 * 直接将 svg 代码注入到页面中，通过浏览器自身的修复能力处理 svg 代码，再通过 serializeToString 得到规范的 svg 代码。
 * 经过各种测试，发现有时候 mermaid 生成的 svg 代码并不规范，直接转化 base64 将无法完整显示。
 * 这里的做法是直接将 svg 代码注入到页面中，通过浏览器自身的修复能力处理 svg 代码，再通过 serializeToString 得到规范的 svg 代码。
 */
export function MermaidSVGPreviewDangerous(props: {
  svgCode: string
  svgId: string
  mermaidCode: string
  className?: string
  generating?: boolean
}) {
  const { svgId, svgCode, mermaidCode, className, generating } = props
  const { t } = useTranslation()
  const setPictureShow = useSetAtom(atoms.pictureShowAtom)
  if (!svgCode.includes('</svg') && generating) {
    return <Loading />
  }
  return (
    <div
      className={cn('cursor-pointer my-2', className)}
      onClick={async () => {
        const svg = document.getElementById(svgId)
        if (!svg) {
          return
        }
        const serializedSvgCode = new XMLSerializer().serializeToString(svg)
        const base64 = picUtils.svgCodeToBase64(serializedSvgCode)
        const pngBase64 = await picUtils.svgToPngBase64(base64)
        setPictureShow({
          picture: {
            url: pngBase64,
          },
          extraButtons: [
            {
              onClick: () => {
                copyToClipboard(mermaidCode)
                toastActions.add(t('copied to clipboard'))
              },
              icon: <DataObjectIcon />,
            },
          ],
        })
      }}
    >
      {/* 这里直接注入了 svg 代码 */}
      <div dangerouslySetInnerHTML={{ __html: svgCode }} />
    </div>
  )
}

export function SVGPreview(props: { xmlCode: string; className?: string; generating?: boolean }) {
  let { xmlCode, className, generating } = props
  const setPictureShow = useSetAtom(atoms.pictureShowAtom)
  const svgBase64 = useMemo(() => {
    if (!xmlCode.includes('</svg') && generating) {
      return ''
    }
    // xmlns 属性告诉浏览器该 XML 文档使用的是 SVG 命名空间，缺少该属性会导致浏览器无法正确渲染 SVG 代码。
    if (!xmlCode.includes('xmlns="http://www.w3.org/2000/svg"')) {
      xmlCode = xmlCode.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"')
    }
    try {
      return picUtils.svgCodeToBase64(xmlCode)
    } catch (e) {
      console.error(e)
      return ''
    }
  }, [xmlCode, generating])
  if (!svgBase64) {
    return <Loading />
  }
  return (
    <div
      className={cn('cursor-pointer my-2', className)}
      onClick={async () => {
        // 图片预览窗口中直接显示 png 图片。因为在实际测试中发现，桌面端无法正常显示 SVG 图片，但网页端可以。
        const pngBase64 = await picUtils.svgToPngBase64(svgBase64)
        setPictureShow({
          picture: { url: pngBase64 },
        })
      }}
    >
      <Img src={svgBase64} />
    </div>
  )
}

async function mermaidCodeToSvgCode(source: string, theme: 'light' | 'dark') {
  mermaid.initialize({ theme: theme === 'light' ? 'default' : 'dark' })
  const id = 'mermaidtmp' + Math.random().toString(36).substring(2, 15)
  const result = await mermaid.render(id, source)
  // 考虑到 mermaid 工具内部本身已经使用了 dompurify 进行处理，因此可以先假设它的输出是安全的
  // 经过测试，发现 dompurify.sanitize 有时候会导致最终的 svg 显示不完整
  // 考虑到现代浏览器都不会执行 svg 中的 script 标签，所以这里不进行 sanitize。参考：https://stackoverflow.com/questions/7917008/xss-when-loading-untrusted-svg-using-img-tag
  // return dompurify.sanitize(result.svg, { USE_PROFILES: { svg: true, svgFilters: true } })
  return { id, svg: result.svg }
}
