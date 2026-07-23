import { cn } from '@/lib/utils'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import {
  bookmarkMutationAtoms,
  EMPTY_BOOKMARK,
  promptCommandAtom,
  PromptCommands,
  selectedBookmarkAtom,
  selectedBookmarkOnMountAtom,
} from '../bookmark-controller/bookmark-atoms'
import Prompt from '../Prompt'
import { GenericHeader } from '../GenericHeader'
import CommandPromptControls from './CommandPromptControls'
import CommandInputs from './CommandInputs'

export const COMMAND_SPECIFIC_COPY: Record<
  PromptCommands,
  { header: string; cancel: string; confirm: string }
> = {
  'new-bookmark': {
    header: 'Create New Bookmark',
    cancel: 'cancel',
    confirm: 'create bookmark',
  },
  'update-bookmark': {
    header: 'Update Existing Bookmark',
    cancel: 'cancel',
    confirm: 'update',
  },
  'new-group': {
    header: 'Create New Group',
    cancel: 'cancel',
    confirm: 'create group',
  },
  'update-group': {
    header: 'Update Existing Group',
    cancel: 'cancel',
    confirm: 'update',
  },
  'remove-group': {
    header: 'Remove Existing Group',
    cancel: 'cancel',
    confirm: 'remove',
  },
  '': { header: 'Remove Existing Group', cancel: '', confirm: '' },
}

export type CommandPromptProps = {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CommandPrompt(props: CommandPromptProps) {
  const { isShown, setIsShown } = props
  const command = useAtomValue(promptCommandAtom)
  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const [_, setSelectedBookmarkOnMount] = useAtom(selectedBookmarkOnMountAtom)
  const contentRef = useRef<HTMLInputElement>(null)
  const promptRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const contentEl = contentRef.current
    if (contentEl) {
      const firstInteractiveEl = contentEl.querySelector<HTMLButtonElement>(
        'a, button, input, select, textarea',
      )
      firstInteractiveEl?.focus()
    }
    if (isShown) {
      setSelectedBookmarkOnMount(selectedBookmark)
    }
    return () => {
      setSelectedBookmark({ ...EMPTY_BOOKMARK })
    }
  }, [isShown])

  return (
    <CommandPromptWrapper
      promptRef={promptRef}
      contentRef={contentRef}
      {...props}
    >
      <div className={cn('flex items-center justify-center')}>
        <GenericHeader>{COMMAND_SPECIFIC_COPY[command].header}</GenericHeader>
      </div>
      <CommandInputs command={command} />
      <CommandPromptControls command={command} setIsShown={setIsShown} />
    </CommandPromptWrapper>
  )
}

type CommandPromptWrapper = {
  promptRef: React.RefObject<HTMLDivElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
} & PropsWithChildren &
  CommandPromptProps
function CommandPromptWrapper(props: CommandPromptWrapper) {
  const { isShown, setIsShown, promptRef, contentRef, children } = props
  return (
    <Prompt
      // TODO: animate shake x
      className={cn('')}
      isShown={isShown}
      setIsShown={setIsShown}
      ref={promptRef}
      unstyled
    >
      <div
        className={cn(
          'BookmarkPrompt-content flex flex-col gap-4 m-2',
          'max-w-105',
          // 'bg-background',
        )}
        ref={contentRef}
        // data-has-new-bookmark-data={hadNeededNewBookmarkProps}
        // data-has-group={Boolean(group)}
        // data-action-type={type}
      >
        {children}
      </div>
    </Prompt>
  )
}
