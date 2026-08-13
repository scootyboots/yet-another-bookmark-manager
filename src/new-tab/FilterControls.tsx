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
  updateFilterAtom,
} from './bookmark-controller/bookmark-atoms'
import { BookmarkPromptType } from './BookmarkPrompt'
import { PropsWithChildren } from 'react'
import usePromptController from './command-prompts/usePromptController'
import { Filter } from '@/background'

export type FilterControlsProps = {
  filter: Filter
  isEmptyFilter: boolean
  addBookmark?: boolean
  editFilter?: boolean
  removeFilter?: boolean
  // setShowBkPrompt: (value: React.SetStateAction<boolean>) => void
  // colIndex: number
  // groupIndex: number
} & PropsWithChildren

export default function FilterControls(props: FilterControlsProps) {
  const {
    filter,
    isEmptyFilter,
    children,
    addBookmark = false,
    editFilter = true,
    removeFilter = true,
  } = props
  const setSelectedBookmark = useSetAtom(selectedBookmarkAtom)
  const setPromptCommand = useSetAtom(promptCommandAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const promptController = usePromptController()
  const updateFilter = useSetAtom(updateFilterAtom)

  return (
    <div>
      <div className={cn('bookmark-group', 'flex gap-1 items-center')}>
        {children}
        <PopOutMenu focusOnMount={isEmptyFilter} menuClasses={cn('w-38.75')}>
          <IconButton
            icon={<Edit />}
            clickHandler={() => {
              updateFilter({ ...filter, limit: 20 })
              console.log('set limit')
            }}
          >
            set limit
          </IconButton>
          {addBookmark && (
            <IconButton
              icon={<Add />}
              clickHandler={() => {
                // promptController.newBookmark(groupName)
              }}
            >
              add bookmark
            </IconButton>
          )}
          {editFilter && (
            <IconButton
              icon={<Edit />}
              clickHandler={() => {
                // promptController.updateGroup(groupName)
              }}
            >
              edit filter
            </IconButton>
          )}
          {removeFilter && (
            <IconButton
              icon={<RemoveCircle />}
              clickHandler={() => {
                // promptController.removeGroup(groupName)
              }}
            >
              remove filter
            </IconButton>
          )}
        </PopOutMenu>
      </div>
    </div>
  )
}
