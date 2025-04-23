import { Message } from '../../../shared/types'
import { ModelInterface } from '../models/base'

export { streamText } from './stream-text'

export async function generateText(model: ModelInterface, messages: Message[]) {
  return model.chat(messages, {})
}

export async function generateImage(
  model: ModelInterface,
  params: { prompt: string; num: number; signal?: AbortSignal; callback?: (picBase64: string) => void }
) {
  return model.paint(params.prompt, params.num, params.callback, params.signal)
}
