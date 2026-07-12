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
  selectedBookmarkAtom,
} from './bookmark-controller/bookmark-atoms'
import { BookmarkPromptType } from './BookmarkPrompt'
import { PropsWithChildren } from 'react'
import { InitPrompt } from './NewTab'

export type GroupControlsProps = {
  groupName: string
  isEmptyGroup: boolean
  setBookmarkPromptType: (
    value: React.SetStateAction<BookmarkPromptType>,
  ) => void
  setShowBkPrompt: (value: React.SetStateAction<boolean>) => void
  colIndex: number
  groupIndex: number
  initPrompt: InitPrompt
} & PropsWithChildren

export default function GroupControls(props: GroupControlsProps) {
  const {
    groupName,
    isEmptyGroup,
    setBookmarkPromptType,
    setShowBkPrompt,
    colIndex,
    groupIndex,
    children,
    initPrompt,
  } = props
  const setSelectedBookmark = useSetAtom(selectedBookmarkAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
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
              initPrompt.newBookmark(groupName)
            }}
          >
            add bookmark
          </IconButton>
          <IconButton
            icon={<AddCircle />}
            clickHandler={() => {
              setBookmarkPromptType('new-group')
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
              initPrompt.updateBookmark(groupName, colIndex)
            }}
          >
            update group
          </IconButton>
          <IconButton
            icon={<RemoveCircle />}
            clickHandler={() => {
              initPrompt.removeGroup(groupName)
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
