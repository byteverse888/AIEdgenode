import { createParser } from 'eventsource-parser'
import { ApiError } from '../packages/models/errors'

async function* iterableStreamAsync(stream: ReadableStream): AsyncIterableIterator<Uint8Array> {
  const reader = stream.getReader()
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) {
        return
      } else {
        yield value
      }
    }
  } finally {
    reader.releaseLock()
  }
}

export async function handleSSE(response: Response, onMessage: (message: string) => void) {
  // 状态码不在 200～299 之间，一般是接口报错了
  if (!response.ok) {
    const errJson = await response.json().catch(() => null)
    throw new ApiError(errJson ? JSON.stringify(errJson) : `${response.status} ${response.statusText}`)
  }
  if (!response.body) {
    throw new Error('No response body')
  }
  const parser = createParser((event) => {
    if (event.type === 'event') {
      onMessage(event.data)
    }
  })
  const decoder = new TextDecoder()
  for await (const chunk of iterableStreamAsync(response.body)) {
    const str = decoder.decode(chunk, { stream: true })
    parser.feed(str)
  }
}

export async function handleNdjson(response: Response, onMessage: (message: string) => void) {
  // 状态码不在 200～299 之间，一般是接口报错了
  if (!response.ok) {
    const errJson = await response.json().catch(() => null)
    throw new ApiError(errJson ? JSON.stringify(errJson) : `${response.status} ${response.statusText}`)
  }
  if (!response.body) {
    throw new Error('No response body')
  }
  let buffer = ''
  const decoder = new TextDecoder()
  for await (const chunk of iterableStreamAsync(response.body)) {
    let data = decoder.decode(chunk, { stream: true })
    buffer = buffer + data
    let lines = buffer.split('\n')
    if (lines.length <= 1) {
      continue
    }
    buffer = lines[lines.length - 1]
    lines = lines.slice(0, -1)
    for (const line of lines) {
      if (line.trim() !== '') {
        onMessage(line)
      }
    }
  }
}
