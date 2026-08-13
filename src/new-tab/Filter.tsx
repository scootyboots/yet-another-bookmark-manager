import { PropsWithChildren, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { type Filter as FilterType } from '@/background'
import FilterControls from './FilterControls'
import { GenericHeader } from './GenericHeader'
import BookmarkEntry from './bookmark-entry/BookmarkEntry'
import { PromptController } from './command-prompts/usePromptController'
import { bookmarkMutationAtoms } from './bookmark-controller/bookmark-atoms'

export type FilterProps = {
  filter: FilterType
  promptController: PromptController
  showDate?: boolean
  showCount?: boolean
  addBookmark?: boolean
  editFilter?: boolean
  removeFilter?: boolean
} & PropsWithChildren

export default function Filter({
  filter,
  promptController,
  showDate = false,
  showCount = false,
  addBookmark = false,
  editFilter = false,
  removeFilter = true,
  children,
}: FilterProps) {
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)
  const displayedBookmarks = useMemo(() => {
    if (filter?.limit) {
      return filter?.bookmarks?.slice(0, filter?.limit)
    }
    return filter?.bookmarks ?? []
  }, [filter?.bookmarks, filter?.limit])

  return (
    <div>
      <FilterControls
        filter={filter}
        isEmptyFilter={false}
        addBookmark={addBookmark}
        editFilter={editFilter}
        removeFilter={removeFilter}
      >
        <GenericHeader>{filter?.name}</GenericHeader>
      </FilterControls>
      {(displayedBookmarks || []).map((bk, i) => (
        <BookmarkEntry
          bookmark={bk}
          showBookmarkPrompt={promptController.setIsPromptShown}
          removeBookmark={removeBookmark}
          index={i}
          key={'newest-to-oldest-' + i}
          showDate={showDate}
          showCount={showCount}
        />
      ))}
      {children}
    </div>
  )
}
