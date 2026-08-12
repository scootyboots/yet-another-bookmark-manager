import { useEffect, useState } from 'react'
import BookmarkEntry from './bookmark-entry/BookmarkEntry'
import Search from './Search/Search'
import useBookmarkSorter from './useBookmarkSorter'
import { useTrackFocus } from './useTrackFocus'
import TopContextRow from './TopContextRow'
import { checkPromptOpen, isEmptyBookmark } from './util'
import CommandLine from './command-prompts/CommandLine'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  bookmarksAtom,
  selectedBookmarkAtom,
  showSearchAtom,
  showCommandLineAtom,
  bookmarksNewestToOldestReadOnlyAtom,
  mostVisitedBookmarksReadOnlyAtom,
  recentLinksAtom,
  filtersAtom,
  EMPTY_FILTER,
} from './bookmark-controller/bookmark-atoms'
import { cn } from '@/lib/utils'
import { GenericHeader } from './GenericHeader'
import GroupControls from './GroupControls'
import { ShadTesting } from './ShadTesting'
import { Button } from '@/components/ui/button'
import CommandPrompt from './command-prompts/CommandPrompt'
import usePromptController from './command-prompts/usePromptController'
import useInitializeBookmarks from './bookmark-controller/useInitializeBookmarks'
import FilterControls from './FilterControls'
import Filter from './Filter'

// TODO: control from options
const GRID_COLS = 3

export default function NewTab() {
  useInitializeBookmarks()
  const [showSearch, setShowSearch] = useAtom(showSearchAtom)
  const [showCommandLine, setShowCommandLine] = useAtom(showCommandLineAtom)
  const selectedBookmark = useAtomValue(selectedBookmarkAtom)
  const filters = useAtomValue(filtersAtom)
  const reset = useSetAtom(bookmarkMutationAtoms.clearBookmarksAtom)
  const promptController = usePromptController()
  const [newestToOldestFilter, mostVisitedFilter, recentlyOpenedFilter] =
    filters.preset

  const { focusPreviousElement } = useTrackFocus()

  useEffect(() => {
    function keydownHandler(event: KeyboardEvent) {
      const isPromptOpen = checkPromptOpen()
      const { key, metaKey } = event
      if (key === 'k' && metaKey) {
        setShowSearch(true)
      }
      if (key === '.' && !isPromptOpen) {
        setShowCommandLine(true)
      }
    }
    document.addEventListener('keydown', keydownHandler)
  }, [])

  useEffect(() => {
    console.log('FILTERS FROM ATOM ----')
    console.log(filters)
  }, [filters])

  return (
    <>
      <div className={cn('NewTab z-10 absolute')}>
        <div className={cn('selected-bookmark hidden')}>
          {JSON.stringify(selectedBookmark)}
        </div>
        <TopContextRow>
          <Button
            onClick={() => {
              reset()
            }}
          >
            reset
          </Button>
          <div>
            <button>mod</button> + <button>k</button> to search
          </div>
          <div>
            <button>.</button> for command line
          </div>
        </TopContextRow>

        <div
          className={cn(
            'bookmark-display gap-4 grid p-4',
            `grid-cols-${GRID_COLS}`,
          )}
        >
          <Filter
            filter={newestToOldestFilter}
            promptController={promptController}
            showDate
          />
          <Filter
            filter={mostVisitedFilter}
            promptController={promptController}
            showCount
          >
            <Filter
              filter={recentlyOpenedFilter}
              promptController={promptController}
            />
          </Filter>
          <Filter
            filter={{ ...EMPTY_FILTER, name: 'custom filters' }}
            promptController={promptController}
          />
        </div>
      </div>
      {showSearch ? (
        <Search
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          promptUpdateBookmark={promptController.updateBookmark}
        />
      ) : null}
      {promptController.isPromptShown ? <CommandPrompt /> : null}
      {showCommandLine ? (
        <CommandLine
          isShown={showCommandLine}
          setIsShown={setShowCommandLine}
          setShowSearch={setShowSearch}
        />
      ) : null}
    </>
  )
}
