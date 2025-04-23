import type { DragEndEvent } from '@dnd-kit/core'
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import NiceModal from '@ebay/nice-modal-react'
import { IconButton, ListSubheader, MenuList } from '@mui/material'
import { useRouterState } from '@tanstack/react-router'
import { useAtomValue } from 'jotai'
import { MutableRefObject } from 'react'
import { useTranslation } from 'react-i18next'
import * as atoms from '../stores/atoms'
import { reorderSessions } from '../stores/session-store'
import SessionItem from './SessionItem'

export interface Props {
  sessionListRef: MutableRefObject<HTMLDivElement | null>
}

export default function SessionList(props: Props) {
  const sortedSessions = useAtomValue(atoms.sortedSessionsAtom)
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 10,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  const onDragEnd = (event: DragEndEvent) => {
    if (!event.over) {
      return
    }
    const activeId = event.active.id
    const overId = event.over.id
    if (activeId !== overId) {
      const oldIndex = sortedSessions.findIndex((s) => s.id === activeId)
      const newIndex = sortedSessions.findIndex((s) => s.id === overId)
      reorderSessions(oldIndex, newIndex)
    }
  }
  const routerState = useRouterState()

  return (
    <MenuList
      sx={{
        width: '100%',
        overflow: 'auto',
        '& ul': { padding: 0 },
        flexGrow: 1,
      }}
      subheader={<Subheader openClearWindow={() => NiceModal.show('clear-session-list')} />}
      component="div"
      ref={props.sessionListRef}
    >
      <DndContext
        modifiers={[restrictToVerticalAxis]}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext items={sortedSessions} strategy={verticalListSortingStrategy}>
          {sortedSessions.map((session, ix) => (
            <SortableItem key={session.id} id={session.id}>
              <SessionItem
                key={session.id}
                selected={routerState.location.pathname === `/session/${session.id}`}
                session={session}
              />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
    </MenuList>
  )
}

function Subheader(props: { openClearWindow: () => void }) {
  const { t } = useTranslation()
  return (
    <ListSubheader
      className="flex justify-between items-center"
      sx={{
        padding: '0.1rem 0.3rem 0.1rem 0.5rem',
      }}
    >
      <span className="text-xs opacity-80">{t('chat')}</span>
      <IconButton onClick={props.openClearWindow}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-4 h-4 opacity-80"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </IconButton>
    </ListSubheader>
  )
}

function SortableItem(props: { id: string; children?: React.ReactNode }) {
  const { id, children } = props
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}
