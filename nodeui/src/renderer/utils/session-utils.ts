import { mapValues } from 'lodash'
import { Session } from 'src/shared/types'
import { migrateMessage } from './message'

export function migrateSession(session: Session): Session {
  return {
    ...session,
    messages: session.messages.map((m) => migrateMessage(m)),
    threads: session.threads?.map((t) => ({
      ...t,
      messages: t.messages.map((m) => migrateMessage(m)),
    })),
    messageForksHash: mapValues(session.messageForksHash || {}, (forks) => ({
      ...forks,
      lists: forks.lists.map((list) => ({
        ...list,
        messages: list.messages.map((m) => migrateMessage(m)),
      })),
    })),
  }
}
