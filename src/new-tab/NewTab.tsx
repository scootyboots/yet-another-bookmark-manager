import { useEffect, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './bookmark-entry/BookmarkEntry'
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
  setPromptCommandAtom,
  promptCommandAtom,
  showPromptAtom,
} from './bookmark-controller/bookmark-atoms'
import { cn } from '@/lib/utils'
import { GenericHeader } from './GenericHeader'
import GroupControls from './GroupControls'
import { ShadTesting } from './ShadTesting'
import { Button } from '@/components/ui/button'
import CommandPrompt from './command-prompts/CommandPrompt'
import { Bookmark } from '@/background'
import usePromptController from './command-prompts/usePromptController'

type Bookmarks = typeof bookmarksJson

export default function NewTab() {
  useInitializeBookmarks()
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const bookmarks = useAtomValue(bookmarksAtom)
  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const sorter = useBookmarkSorter(bookmarks)

  const reset = useSetAtom(bookmarkMutationAtoms.clearBookmarksAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)

  const setCommandAtom = useSetAtom(setPromptCommandAtom)
  const promptController = usePromptController()

  const commands: Command[] = [
    {
      action: () => {
        // initPrompt.newBookmark()
        promptController.newBookmark()
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    {
      action: () => {
        promptController.newGroup()
      },
      name: 'add group',
      hotKey: 'jj',
    },
    {
      action: () => {
        promptController.removeGroup()
      },
      name: 'remove group',
      hotKey: 'dd',
    },
    {
      action: () => {
        promptController.updateGroup()
      },
      name: 'update group',
      hotKey: 'uu',
    },
    {
      action: () => {
        setShowSearch(true)
      },
      name: 'search',
      hotKey: 'ss',
    },
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
        <Button onClick={() => promptController.newBookmark()}>
          add bk atom
        </Button>
        <ShadTesting />
        <div>
          <button>mod</button> + <button>k</button> to search
        </div>
        <div>
          <button>.</button> for command line
        </div>
        <button
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
        </button>
      </TopContextRow>

      {showSearch ? (
        <Search
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          promptUpdateBookmark={promptController.updateBookmark}
        />
      ) : null}
      {promptController.isPromptShown ? <CommandPrompt /> : null}
      {/* {showBkPrompt || promptAtom ? (
        <CommandPrompt isShown={showBkPrompt} setIsShown={setShowBkPrompt} />
      ) : null} */}
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
                        setShowBkPrompt={setShowBkPrompt}
                      >
                        <GenericHeader>{groupName}</GenericHeader>
                      </GroupControls>
                    ) : null}
                    {!isEmptyBookmarkEntry && (
                      <BookmarkEntry
                        bookmark={entry}
                        showBookmarkPrompt={setShowBkPrompt}
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
    </div>
  )
}
