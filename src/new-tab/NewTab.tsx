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
} from './bookmark-controller/bookmark-atoms'
import { cn } from '@/lib/utils'
import { GenericHeader } from './GenericHeader'
import GroupControls from './GroupControls'
import { ShadTesting } from './ShadTesting'
import { Button } from '@/components/ui/button'
import CommandPrompt from './command-prompts/CommandPrompt'
import usePromptController from './command-prompts/usePromptController'
import useInitializeBookmarks from './bookmark-controller/useInitializeBookmarks'

// TODO: control from options
const GRID_COLS = 4

export default function NewTab() {
  useInitializeBookmarks()
  const [showSearch, setShowSearch] = useAtom(showSearchAtom)
  const [showCommandLine, setShowCommandLine] = useAtom(showCommandLineAtom)
  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const bookmarks = useAtomValue(bookmarksAtom)
  const sorter = useBookmarkSorter(bookmarks)
  const bookmarksAscending = useAtomValue(bookmarksNewestToOldestReadOnlyAtom)
  const bookmarksMostVisited = useAtomValue(mostVisitedBookmarksReadOnlyAtom)

  const reset = useSetAtom(bookmarkMutationAtoms.clearBookmarksAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)
  const promptController = usePromptController()

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
    console.log('BOOKMARKS FROM ATOM ----')
    console.log(bookmarks)
  }, [bookmarks])

  return (
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
        {/* <button onClick={focusPreviousElement}>focus previous</button>
        <Button onClick={() => promptController.newBookmark()}>
          add bk atom
        </Button>
        <ShadTesting /> */}
        <div>
          <button>mod</button> + <button>k</button> to search
        </div>
        <div>
          <button>.</button> for command line
        </div>
        {/* <button
          onClick={() => {
            promptController.newBookmark()
          }}
        >
          add bookmark
        </button>
        <button
          onClick={() => {
            promptController.newGroup()
          }}
        >
          add group
        </button> */}
      </TopContextRow>

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

      <div className={cn('bookmark-groups', 'grid-cols-4 gap-4 grid p-4')}>
        {sorter.sortedColumns.map((col, index) => (
          <div key={'col-' + index}>
            <div>
              {col.map((entry, i) => {
                const isFirst = i === 0
                const groupName = entry.group
                const previousGroupName = col.at(i - 1)?.group
                const sameAsLast = previousGroupName === groupName
                const checkEmptyGroup = () => {
                  const entriesInGroup = col.filter(
                    (bk) => bk.group === groupName,
                  )
                  const firstEntry = entriesInGroup[0]
                  return firstEntry.href === '' && entriesInGroup.length === 1
                }
                const isEmptyGroup = checkEmptyGroup()
                const isEmptyBookmarkEntry = isEmptyBookmark(entry)
                return (
                  <div key={`${groupName}-${index}-${i}`}>
                    {!sameAsLast || isFirst ? (
                      <GroupControls
                        groupName={groupName}
                        colIndex={entry.col}
                        groupIndex={entry.groupIndex}
                        isEmptyGroup={isEmptyGroup}
                        setShowBkPrompt={promptController.setIsPromptShown}
                      >
                        <GenericHeader>{groupName}</GenericHeader>
                      </GroupControls>
                    ) : null}
                    {!isEmptyBookmarkEntry && (
                      <BookmarkEntry
                        bookmark={entry}
                        showBookmarkPrompt={promptController.setIsPromptShown}
                        removeBookmark={removeBookmark}
                        index={i}
                        key={'bookmark-entry-' + i}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div
        className={cn(
          'bookmark-display gap-4 grid p-4',
          `grid-cols-${GRID_COLS}`,
        )}
      >
        <div>
          <GenericHeader>newest to oldest</GenericHeader>
          {bookmarksAscending.map((bk, i) => (
            <BookmarkEntry
              bookmark={bk}
              showBookmarkPrompt={promptController.setIsPromptShown}
              removeBookmark={removeBookmark}
              index={i}
              key={'newest-to-oldest-' + i}
            />
          ))}
        </div>
        <div>
          <GenericHeader>most visited</GenericHeader>
          {bookmarksMostVisited.map((bk, i) => (
            <BookmarkEntry
              bookmark={bk}
              showBookmarkPrompt={promptController.setIsPromptShown}
              removeBookmark={removeBookmark}
              index={i}
              key={'most-visited-' + i}
              showCount
            />
          ))}
        </div>
        <div>
          <GenericHeader>filters will go here</GenericHeader>
        </div>
      </div>
    </div>
  )
}
