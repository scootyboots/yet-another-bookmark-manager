import { useAtom, useSetAtom } from 'jotai'
import {
  promptSetAtoms,
  showPromptAtom,
  showSearchSetAtom,
} from '../bookmark-controller/bookmark-atoms'

export default function usePromptController() {
  const [isPromptShown, setIsPromptShown] = useAtom(showPromptAtom)
  const setNewBkPrompt = useSetAtom(promptSetAtoms.newBookmark)
  const setUpdateBookmark = useSetAtom(promptSetAtoms.updateBookmark)
  const setNewGroup = useSetAtom(promptSetAtoms.newGroup)
  const setRemoveGroup = useSetAtom(promptSetAtoms.removeGroup)
  const setUpdateGroup = useSetAtom(promptSetAtoms.updateGroup)
  const setShowSearch = useSetAtom(showSearchSetAtom)
  const commands = [
    {
      action: () => {
        setNewBkPrompt()
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    {
      action: () => {
        setNewGroup()
      },
      name: 'add group',
      hotKey: 'jj',
    },
    {
      action: () => {
        setRemoveGroup()
      },
      name: 'remove group',
      hotKey: 'dd',
    },
    {
      action: () => {
        setUpdateGroup()
      },
      name: 'update group',
      hotKey: 'uu',
    },
    {
      action: () => {
        setShowSearch(true)
      },
      name: 'search',
      hotKey: 'ss',
    },
  ]

  return {
    isPromptShown,
    setIsPromptShown,
    newBookmark: setNewBkPrompt,
    updateBookmark: setUpdateBookmark,
    newGroup: setNewGroup,
    removeGroup: setRemoveGroup,
    updateGroup: setUpdateGroup,
    commands,
  }
}
