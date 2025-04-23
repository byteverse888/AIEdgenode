import * as Sentry from '@sentry/react'
import { Tiktoken } from 'js-tiktoken/lite'
// @ts-ignore
import cl100k_base from 'js-tiktoken/ranks/cl100k_base'
import { getMessageText } from '@/utils/message'
import { Message } from '../../shared/types'

const encoding = new Tiktoken(cl100k_base)
function estimateTokens(str: string): number {
  str = typeof str === 'string' ? str : JSON.stringify(str)
  const tokens = encoding.encode(str)
  return tokens.length
}

// 参考: https://github.com/pkoukk/tiktoken-go#counting-tokens-for-chat-api-calls
// OpenAI Cookbook: https://github.com/openai/openai-cookbook/blob/main/examples/How_to_count_tokens_with_tiktoken.ipynb
export function estimateTokensFromMessages(messages: Message[]) {
  try {
    const tokensPerMessage = 3
    const tokensPerName = 1
    let ret = 0
    for (const msg of messages) {
      ret += tokensPerMessage
      ret += estimateTokens(getMessageText(msg))
      ret += estimateTokens(msg.role)
      if (msg.name) {
        ret += estimateTokens(msg.name)
        ret += tokensPerName
      }
    }
    ret += 3 // every reply is primed with <|start|>assistant<|message|>
    return ret
  } catch (e) {
    Sentry.captureException(e)
    return -1
  }
}

export function sliceTextByTokenLimit(text: string, limit: number) {
  let ret = ''
  let retTokenCount = 0
  const STEP_LEN = 100
  while (text.length > 0) {
    const part = text.slice(0, STEP_LEN)
    text = text.slice(STEP_LEN)
    const partTokenCount = estimateTokens(part)
    if (retTokenCount + partTokenCount > limit) {
      break
    }
    ret += part
    retTokenCount += partTokenCount
  }
  return ret
}
