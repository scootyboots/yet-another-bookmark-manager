import { useAtom, useSetAtom } from 'jotai'
import {
  promptSetAtoms,
  showPromptAtom,
} from '../bookmark-controller/bookmark-atoms'

export default function usePromptController() {
  const [isPromptShown, setIsPromptShown] = useAtom(showPromptAtom)
  const setNewBkPrompt = useSetAtom(promptSetAtoms.newBookmark)
  const setUpdateBookmark = useSetAtom(promptSetAtoms.updateBookmark)
  const setNewGroup = useSetAtom(promptSetAtoms.newGroup)
  const setRemoveGroup = useSetAtom(promptSetAtoms.removeGroup)
  const setUpdateGroup = useSetAtom(promptSetAtoms.updateGroup)
  return {
    isPromptShown,
    setIsPromptShown,
    newBookmark: setNewBkPrompt,
    updateBookmark: setUpdateBookmark,
    newGroup: setNewGroup,
    removeGroup: setRemoveGroup,
    updateGroup: setUpdateGroup,
  }
}
