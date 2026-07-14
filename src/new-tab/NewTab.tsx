import { useEffect, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search/Search'
import BookmarkPrompt, { BookmarkPromptType } from './BookmarkPrompt'
import useBookmarkSorter from './useBookmarkSorter'
import { useTrackFocus } from './useTrackFocus'
import TopContextRow from './TopContextRow'
import { checkPromptOpen, isEmptyBookmark } from './util'
import CommandLine, { Command } from './CommandLine'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  bookmarksAtom,
  selectedBookmarkAtom,
  useInitializeBookmarks,
  EMPTY_BOOKMARK,
} from './bookmark-controller/bookmark-atoms'
import { cn } from '@/lib/utils'
import { GenericHeader } from './GenericHeader'
import GroupControls from './GroupControls'
import { ShadTesting } from './ShadTesting'

type Bookmarks = typeof bookmarksJson

export type InitPrompt = {
  newBookmark: (groupName?: string | undefined) => void
  updateBookmark: (
    groupName?: string | undefined,
    col?: number | undefined,
  ) => void
  newGroup: (colIndex?: number | undefined) => void
  removeGroup: (groupName?: string | undefined) => void
  updateGroup: (groupName?: string | undefined) => void
}

export default function NewTab() {
  useInitializeBookmarks()
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const [bookmarkPromptType, setBookmarkPromptType] =
    useState<BookmarkPromptType>('new-bookmark')
  const bookmarks = useAtomValue(bookmarksAtom)
  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const sorter = useBookmarkSorter(bookmarks)

  const reset = useSetAtom(bookmarkMutationAtoms.clearBookmarksAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)

  const initPrompt = {
    newBookmark: (groupName?: string) => {
      const bk = { ...EMPTY_BOOKMARK, groupName: groupName ?? '' }
      setBookmarkPromptType('new-bookmark')
      setSelectedBookmark(bk)
      setShowBkPrompt(true)
    },
    updateBookmark: (groupName?: string, col?: number) => {
      const bk = {
        ...EMPTY_BOOKMARK,
        groupName: groupName ?? '',
        col: col ?? 0,
      }
      setBookmarkPromptType('update-bookmark')
      setSelectedBookmark(bk)
      setShowBkPrompt(true)
    },
    newGroup: (colIndex?: number) => {
      const bk = { ...EMPTY_BOOKMARK, col: colIndex ?? 0 }
      setBookmarkPromptType('new-group')
      setSelectedBookmark(bk)
      setShowBkPrompt(true)
    },
    removeGroup: (groupName?: string) => {
      const bk = { ...EMPTY_BOOKMARK, groupName: groupName ?? '' }
      setBookmarkPromptType('remove-group')
      setSelectedBookmark(bk)
      setShowBkPrompt(true)
    },
    updateGroup: (groupName?: string) => {
      const bk = { ...EMPTY_BOOKMARK, groupName: groupName ?? '' }
      setBookmarkPromptType('update-group')
      setSelectedBookmark(bk)
      setShowBkPrompt(true)
    },
  }

  const commands: Command[] = [
    {
      action: () => {
        initPrompt.newBookmark()
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    // { action: removeBookmark, name: 'remove bookmark' },
    // looks like we'll handle both of these from search
    // { action: updateBookmark, name: 'update bookmark' },
    {
      action: () => {
        initPrompt.newGroup()
      },
      name: 'add group',
      hotKey: 'jj',
    },
    {
      action: () => {
        initPrompt.removeGroup()
      },
      name: 'remove group',
      hotKey: 'dd',
    },
    {
      action: () => {
        initPrompt.updateGroup()
      },
      name: 'update group',
      hotKey: 'uu',
    },
    // TODO: rename group
  ]

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
        <button
          onClick={() => {
            reset()
            // updateRecentLinks('', '', true)
          }}
        >
          reset
        </button>
        <button onClick={focusPreviousElement}>focus previous</button>
        <div>
          <button>mod</button> + <button>k</button> to search
        </div>
        <div>
          <button>.</button> for command line
        </div>
        <button
          onClick={() => {
            initPrompt.newBookmark()
          }}
        >
          add bookmark
        </button>
        <button
          onClick={() => {
            initPrompt.newGroup()
          }}
        >
          add group
        </button>
      </TopContextRow>

      {showSearch ? (
        <Search
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          promptUpdateBookmark={initPrompt.updateBookmark}
        />
      ) : null}

      {showBkPrompt ? (
        <BookmarkPrompt
          type={bookmarkPromptType}
          isShown={showBkPrompt}
          setIsShown={setShowBkPrompt}
          {...sorter}
        />
      ) : null}
      {showCommandLine ? (
        <CommandLine
          commands={commands}
          isShown={showCommandLine}
          setIsShown={setShowCommandLine}
        />
      ) : null}

      {/* <ShadTesting /> */}

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
                        setBookmarkPromptType={setBookmarkPromptType}
                        setShowBkPrompt={setShowBkPrompt}
                        initPrompt={initPrompt}
                      >
                        <GenericHeader>{groupName}</GenericHeader>
                      </GroupControls>
                    ) : null}
                    {!isEmptyBookmarkEntry && (
                      <BookmarkEntry
                        bookmark={entry}
                        showBookmarkPrompt={setShowBkPrompt}
                        removeBookmark={removeBookmark}
                        setBookmarkPromptType={setBookmarkPromptType}
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
    </div>
  )
}
