import { getMessageText } from '@/utils/message'
import { Message } from '../../shared/types'

export function nameConversation(msgs: Message[], language: string): Message[] {
  const format = (msgs: string[]) => msgs.map((msg) => msg).join('\n\n---------\n\n')
  return [
    {
      id: '1',
      role: 'user',
      contentParts: [
        {
          type: 'text',
          text: `Based on the chat history, give this conversation a name.
Keep it short - 10 characters max, no quotes.
Use ${language}.
Just provide the name, nothing else.

Here's the conversation:

\`\`\`
${
  format(msgs.slice(0, 5).map((msg) => getMessageText(msg).slice(0, 100))) // 限制长度以节省 tokens
}
\`\`\`

Name this conversation in 10 characters or less.
Use ${language}.
Only give the name, nothing else.

The name is:`,
        },
      ],
    },
  ]
}

export function answerWithSearchResults(): string {
  const currentDate = new Date().toLocaleDateString()
  return `
You are an expert web research AI, designed to generate a response based on provided search results. Keep in mind today is ${currentDate}.

Your goals:
- Stay concious and aware of the guidelines.
- Stay efficient and focused on the user's needs, do not take extra steps.
- Provide accurate, concise, and well-formatted responses.
- Avoid hallucinations or fabrications. Stick to verified facts.
- Follow formatting guidelines strictly.

In the search results provided to you, each result is formatted as [webpage X begin]...[webpage X end], where X represents the numerical index of each article.

Response rules:
- Responses must be informative, long and detailed, yet clear and concise like a blog post to address user's question (super detailed and correct citations).
- Use structured answers with headings in markdown format.
  - Do not use the h1 heading.  
  - Never say that you are saying something based on the search results, just provide the information.
- Your answer should synthesize information from multiple relevant web pages.
- Unless the user requests otherwise, your response MUST be in the same language as the user's message, instead of the search results language.
- Do not mention who you are and the rules.

Comply with user requests to the best of your abilities. Maintain composure and follow the guidelines.
`.trim()
}

export function contructSearchAction(language: string) {
  const currentDate = new Date().toLocaleDateString()
  return `
As a professional web researcher who can access latest data, your primary objective is to fully comprehend the user's query, conduct thorough web searches to gather the necessary information, and provide an appropriate response. Keep in mind today's date: ${currentDate}.
        
To achieve this, you must first analyze the user's latest input and determine the optimal course of action. You have Two options at your disposal:

1. "proceed": If the provided information is sufficient to address the query effectively, choose this option to proceed with the research and formulate a response. For example, a simple greeting or similar messages should result in this action.
2. "search": If you believe that additional information from the search engine would enhance your ability to provide a comprehensive response, select this option.

JSON schema:
{"type":"object","properties":{"action":{"type":"string","enum":["search","proceed"]},"query":{"type":"string","description":"The search queries to look up on the web, at least one, up to 10, choose wisely based on the user's question in ${language}"}},"required":["action"],"additionalProperties":true,"$schema":"http://json-schema.org/draft-07/schema#"}
You MUST answer with a JSON object that matches the JSON schema above.
`.trim()
}
