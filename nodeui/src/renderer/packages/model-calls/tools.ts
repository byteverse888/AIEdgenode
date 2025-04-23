import * as promptFormat from '@/packages/prompts'
import * as settingActions from '@/stores/settingActions'
import { last } from 'lodash'
import { ModelInterface } from '../models/base'
import { webSearchExecutor } from '../web-search'
import { sequenceMessages, getMessageText } from '@/utils/message'
import { Message } from 'src/shared/types'
export async function callTool(name: string, args: any, { signal }: { signal?: AbortSignal }) {
  if (name === 'web_search') {
    return webSearchExecutor(args, { abortSignal: signal })
  }
}

export async function searchByPromptEngineering(model: ModelInterface, messages: Message[], signal?: AbortSignal) {
  const language = settingActions.getLanguage()
  const systemPrompt = promptFormat.contructSearchAction(language)
  const result = await model.chat(
    sequenceMessages([
      {
        id: '',
        role: 'system',
        contentParts: [{ type: 'text', text: systemPrompt }],
      },
      ...messages,
    ]),
    { signal }
  )
  // extract json from response
  const regex = /{(?:[^{}]|{(?:[^{}]|{[^{}]*})*})*}/g
  if (result.contentParts[0].type !== 'text') {
    return { query: '', searchResults: [] }
  }
  const match = result.contentParts[0].text.match(regex)
  if (match) {
    for (const jsonString of match) {
      const jsonObject = JSON.parse(jsonString) as {
        action: 'search' | 'proceed'
        query: string
      }
      if (jsonObject.action === 'search') {
        const { searchResults } = await webSearchExecutor({ query: jsonObject.query }, { abortSignal: signal })
        return { query: jsonObject.query?.toString(), searchResults }
      }
    }
  }
}

export function constructMessagesWithSearchResults(
  messages: Message[],
  searchResults: { title: string; snippet: string; link: string }[]
) {
  const systemPrompt = promptFormat.answerWithSearchResults()
  const formattedSearchResults = searchResults
    .map((it, i) => {
      return `[webpage ${i + 1} begin]
Title: ${it.title}
URL: ${it.link}
Content: ${it.snippet}
[webpage ${i + 1} end]`
    })
    .join('\n')

  return sequenceMessages([
    {
      id: '',
      role: 'system',
      contentParts: [{ type: 'text', text: systemPrompt }],
    },
    ...messages.slice(0, -1), // 最新一条用户消息和搜索结果放在一起了
    {
      id: '',
      role: 'user',
      contentParts: [
        { type: 'text', text: `${formattedSearchResults}\nUser Message:\n${getMessageText(last(messages)!)}` },
      ],
    },
  ])
}
