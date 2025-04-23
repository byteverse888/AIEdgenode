/* eslint import/prefer-default-export: off */
import { URL } from 'url'
import path from 'path'

export function resolveHtmlPath(htmlFileName: string) {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212
    const url = new URL(`http://localhost:${port}`)
    url.pathname = htmlFileName
    return url.href
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`
}

export function sliceTextWithEllipsis(text: string, maxLength: number) {
  if (text.length <= maxLength) {
    return text
  }
  // 这里添加了一些根据文本的随机性，避免内容被截断
  const headLength = Math.floor(maxLength * 0.4) + Math.floor(text.length * 0.1)
  const tailLength = Math.floor(maxLength * 0.5)
  const head = text.slice(0, headLength)
  const tail = text.slice(-tailLength)

  return head + tail
}
