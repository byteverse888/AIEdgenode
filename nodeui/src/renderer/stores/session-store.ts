import { getDefaultStore } from 'jotai'
import { migrateSession } from '../utils/session-utils'
import * as atoms from './atoms'
import { copyMessage, copyThreads, Session } from 'src/shared/types'
import { v4 as uuidv4 } from 'uuid'
import { arrayMove } from '@dnd-kit/sortable'
import { omit } from 'lodash'

// session 的读写都放到这里，统一管理

export function getSession(sessionId: string) {
  const store = getDefaultStore()
  const sessions = store.get(atoms.sessionsAtom)
  const session = sessions.find((s) => s.id === sessionId)
  if (!session) {
    return session
  }
  return migrateSession(session)
}

export function createSession(session: Omit<Session, 'id'>, previousId?: string) {
  const s = { ...session, id: uuidv4() }
  const store = getDefaultStore()

  store.set(atoms.sessionsAtom, (sessions) => {
    if (previousId) {
      let previouseSessionIndex = sessions.findIndex((s) => s.id === previousId)
      if (previouseSessionIndex < 0) {
        previouseSessionIndex = sessions.length - 1
      }
      return [...sessions.slice(0, previouseSessionIndex + 1), s, ...sessions.slice(previouseSessionIndex + 1)]
    }
    return [...sessions, s]
  })
  return s
}

// 所有对 session 的修改应该调用这个 function，只修改当前 session，避免其他的 session 经过 migrate 这一步
export function saveSession(session: Partial<Session> & { id: Session['id'] }) {
  const store = getDefaultStore()
  store.set(atoms.sessionsAtom, (sessions) => {
    return sessions.map((s) => (s.id === session.id ? { ...s, ...session } : s))
  })
}

export function removeSession(sessionId: string) {
  const store = getDefaultStore()
  store.set(atoms.sessionsAtom, (sessions) => sessions.filter((s) => s.id !== sessionId))
}

export function reorderSessions(oldIndex: number, newIndex: number) {
  const store = getDefaultStore()
  store.set(atoms.sessionsAtom, (sessions) => {
    const sortedSessions = atoms.sortSessions(sessions)
    return atoms.sortSessions(arrayMove(sortedSessions, oldIndex, newIndex))
  })
}

export function copySession(source: Session): Session {
  const newSession = {
    ...omit(source, 'id', 'messages', 'threads', 'messageForksHash'),
    messages: source.messages.map(copyMessage),
    threads: copyThreads(source.threads),
    messageForksHash: undefined, // 不复制分叉数据
  }
  return createSession(newSession, source.id)
}
