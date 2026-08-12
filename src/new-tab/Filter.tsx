import { PropsWithChildren } from 'react'
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
} & PropsWithChildren

export default function Filter({
  filter,
  promptController,
  showDate = false,
  showCount = false,
  children,
}: FilterProps) {
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)
  return (
    <div>
      <FilterControls filterName={filter?.name} isEmptyFilter={false}>
        <GenericHeader>{filter?.name}</GenericHeader>
      </FilterControls>
      {(filter?.bookmarks || []).map((bk, i) => (
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
