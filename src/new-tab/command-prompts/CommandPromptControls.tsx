import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAtomValue, useSetAtom, useAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  PromptCommands,
  selectedBookmarkAtom,
  selectedBookmarkOnMountAtom,
  showPromptAtom,
  showPromptSetAtom,
} from '../bookmark-controller/bookmark-atoms'
import { useMemo, useState } from 'react'
import { COMMAND_SPECIFIC_COPY } from './CommandPrompt'

type CommandPromptControlsProps = {
  command: PromptCommands
  // setIsShown: React.Dispatch<React.SetStateAction<boolean>>
}

export default function CommandPromptControls(
  props: CommandPromptControlsProps,
) {
  const { command } = props
  const addBookmark = useSetAtom(bookmarkMutationAtoms.addBookmarkAtom)
  const updateBookmark = useSetAtom(bookmarkMutationAtoms.updateBookmarkAtom)
  const addGroup = useSetAtom(bookmarkMutationAtoms.addGroupAtom)
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)
  const updateGroupName = useSetAtom(bookmarkMutationAtoms.updateGroupNameAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const removeGroup = useSetAtom(bookmarkMutationAtoms.removeGroupAtom)
  const selectedBookmark = useAtomValue(selectedBookmarkAtom)
  const selectedBookmarkOnMount = useAtomValue(selectedBookmarkOnMountAtom)
  const setPromptShown = useSetAtom(showPromptSetAtom)

  const { cancel, confirm } = useMemo(() => {
    return COMMAND_SPECIFIC_COPY[command]
  }, [command])
  const hasRequiredInputs = useMemo(() => {
    console.log('checked for required inputs')
    switch (command) {
      case 'new-bookmark': {
        return (
          selectedBookmark.text &&
          selectedBookmark.href &&
          selectedBookmark.group
        )
        break
      }
      case 'update-bookmark': {
        return (
          selectedBookmark.text &&
          selectedBookmark.href &&
          selectedBookmark.group &&
          selectedBookmark.col &&
          selectedBookmark.id
        )
        break
      }
      case 'new-group': {
        return (
          selectedBookmark.group &&
          selectedBookmark.groupIndex &&
          selectedBookmark.col
        )
        break
      }
      case 'update-group': {
        const currentGroupName = selectedBookmark.group
        const onMountGroupName = selectedBookmark.group

        const currentGroupOrder = selectedBookmark.groupIndex
        const onMountGroupOrder = selectedBookmark.groupIndex
        return (
          (currentGroupName && onMountGroupName) ||
          currentGroupOrder !== onMountGroupOrder
        )
        break
      }
      case 'remove-group': {
        return selectedBookmark.group
      }
      default: {
        break
      }
    }
    return false
  }, [selectedBookmark])

  function pickConfirmFunction(command: PromptCommands) {
    switch (command) {
      case 'new-bookmark': {
        addBookmark(selectedBookmark)
        break
      }
      case 'update-bookmark': {
        updateBookmark(selectedBookmark)
        break
      }
      case 'new-group': {
        addGroup(
          selectedBookmark.group,
          selectedBookmark.groupIndex,
          selectedBookmark.col,
        )
        break
      }
      case 'update-group': {
        const currentGroupName = selectedBookmark.group
        const onMountGroupName = selectedBookmark.group
        const currentGroupOrder = selectedBookmark.groupIndex
        const onMountGroupOrder = selectedBookmark.groupIndex
        if (currentGroupName !== onMountGroupName) {
          updateGroupName(selectedBookmarkOnMount.group, selectedBookmark.group)
        }
        if (currentGroupOrder !== onMountGroupOrder) {
          // TODO: figure out how to handle "raise" / "lower"
          // updateGroupOrder(selectedBookmark.group, selectedBookmark.col)
        }

        break
      }
      case 'remove-group': {
        removeGroup(selectedBookmark.group)
      }
      default: {
        break
      }
    }
    setPromptShown(false)
  }

  return (
    <div className={cn('flex justify-end-safe gap-4')}>
      <Button
        variant={'outline'}
        onClick={() => {
          // cancelFn?.()
          setPromptShown(false)
        }}
      >
        {cancel}
      </Button>
      <Button
        variant={'outline'}
        onClick={() => pickConfirmFunction(command)}
        disabled={!hasRequiredInputs}
      >
        {confirm}
      </Button>
    </div>
  )
}
