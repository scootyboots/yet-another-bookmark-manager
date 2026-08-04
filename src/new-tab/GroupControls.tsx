import { cn } from '@/lib/utils'
import PopOutMenu from './PopOutMenu'
import IconButton from './IconButton'
import Add from '@/components/Icons/Add'
import RemoveCircle from '@/components/Icons/RemoveCircle'
import Edit from '@/components/Icons/Edit'
import ArrowUpCircle from '@/components/Icons/ArrowUpCircle'
import ArrowDownCircle from '@/components/Icons/ArrowDownCircle'
import AddCircle from '@/components/Icons/AddCircle'
import { useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  EMPTY_BOOKMARK,
  promptCommandAtom,
  selectedBookmarkAtom,
} from './bookmark-controller/bookmark-atoms'
import { BookmarkPromptType } from './BookmarkPrompt'
import { PropsWithChildren } from 'react'
import usePromptController from './command-prompts/usePromptController'

export type GroupControlsProps = {
  groupName: string
  isEmptyGroup: boolean
  setShowBkPrompt: (value: React.SetStateAction<boolean>) => void
  colIndex: number
  groupIndex: number
} & PropsWithChildren

export default function GroupControls(props: GroupControlsProps) {
  const {
    groupName,
    isEmptyGroup,
    setShowBkPrompt,
    colIndex,
    groupIndex,
    children,
  } = props
  const setSelectedBookmark = useSetAtom(selectedBookmarkAtom)
  const setPromptCommand = useSetAtom(promptCommandAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const promptController = usePromptController()
  return (
    <div>
      <div className={cn('bookmark-group', 'flex gap-1 items-center')}>
        {children}
        <PopOutMenu
          focusOnMount={isEmptyGroup}
          menuClasses={cn('w-38.75', {
            // '-bottom-18': isFirst,
            // 'bottom-[-3.15rem]': !isFirst,
          })}
        >
          <IconButton
            icon={<Add />}
            clickHandler={() => {
              // setSelectedBookmark({ ...EMPTY_BOOKMARK, group: groupName })
              // setPromptCommand('new-bookmark')
              promptController.newBookmark(groupName)
            }}
          >
            add bookmark
          </IconButton>
          <IconButton
            icon={<AddCircle />}
            clickHandler={() => {
              setPromptCommand('new-group')
              setShowBkPrompt(true)
              setSelectedBookmark({
                ...EMPTY_BOOKMARK,
                col: colIndex,
              })
            }}
          >
            add group
          </IconButton>
          <IconButton
            icon={<Edit />}
            clickHandler={() => {
              promptController.updateGroup(groupName)
            }}
          >
            update group
          </IconButton>
          <IconButton
            icon={<RemoveCircle />}
            clickHandler={() => {
              promptController.removeGroup(groupName)
            }}
          >
            remove group
          </IconButton>

          <IconButton
            icon={<ArrowDownCircle />}
            clickHandler={() =>
              updateGroupOrder(groupName, colIndex + 1, 'lower')
            }
          >
            move group down
          </IconButton>
          <IconButton
            icon={<ArrowUpCircle />}
            clickHandler={() =>
              updateGroupOrder(groupName, colIndex + 1, 'raise')
            }
          >
            move group up
          </IconButton>
        </PopOutMenu>
      </div>
    </div>
  )
}
