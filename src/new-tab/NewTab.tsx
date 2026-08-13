import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import Search from './Search/Search'
import { useTrackFocus } from './useTrackFocus'
import TopContextRow from './TopContextRow'
import { checkPromptOpen } from './util'
import CommandLine from './command-prompts/CommandLine'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  selectedBookmarkAtom,
  showSearchAtom,
  showCommandLineAtom,
  filtersAtom,
  EMPTY_FILTER,
} from './bookmark-controller/bookmark-atoms'
import { Button } from '@/components/ui/button'
import CommandPrompt from './command-prompts/CommandPrompt'
import usePromptController from './command-prompts/usePromptController'
import useInitializeBookmarks from './bookmark-controller/useInitializeBookmarks'
import Filter from './Filter'

// TODO: control from options
const GRID_COLS = 4

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
            'bookmark-display gap-4 grid p-4 grid-cols-4',
            `grid-cols-${GRID_COLS}`,
          )}
        >
          <Filter
            filter={{ ...EMPTY_FILTER, name: 'custom filters' }}
            promptController={promptController}
            addBookmark
            editFilter
          />
          <Filter
            filter={{ ...EMPTY_FILTER, name: 'custom filters' }}
            promptController={promptController}
            addBookmark
            editFilter
          />
          <Filter
            filter={mostVisitedFilter}
            promptController={promptController}
            editFilter
            showCount
          >
            <Filter
              filter={recentlyOpenedFilter}
              promptController={promptController}
              editFilter
            />
          </Filter>
          <Filter
            filter={newestToOldestFilter}
            promptController={promptController}
            editFilter
            showDate
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
