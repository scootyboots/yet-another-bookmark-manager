import { PropsWithChildren, Ref, useEffect, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search/Search'
import BookmarkPrompt, { BookmarkPromptType } from './BookmarkPrompt'
import { Bookmark } from '../background'
import useBookmarkSorter from './useBookmarkSorter'
import ArrowDownCircle from '../components/Icons/ArrowDownCircle'
import Add from '../components/Icons/Add'
import AddCircle from '../components/Icons/AddCircle'
import ArrowUpCircle from '../components/Icons/ArrowUpCircle'
import PopOutMenu from './PopOutMenu'
import { useTrackFocus } from './useTrackFocus'
import IconButton from './IconButton'
import TopContextRow from './TopContextRow'
import { checkPromptOpen, isEmptyBookmark } from './util'
import CommandLine, { Command } from './CommandLine'
import RemoveCircle from '../components/Icons/RemoveCircle'
import Edit from '../components/Icons/Edit'
import { motion } from 'motion/react'
import { useAtom, useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  bookmarksAtom,
  clearSelectedBookmarkAtom,
  selectedBookmarkAtom,
  useInitializeBookmarks,
  EMPTY_BOOKMARK,
} from './bookmark-controller/bookmark-atoms'
import { cn } from '@/lib/utils'
import { GenericHeader } from './GenericHeader'

type Bookmarks = typeof bookmarksJson

export default function NewTab() {
  useInitializeBookmarks()
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const [bookmarkPromptType, setBookmarkPromptType] =
    useState<BookmarkPromptType>('new-bookmark')

  const { focusPreviousElement } = useTrackFocus()
  const bookmarks = useAtomValue(bookmarksAtom)

  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const clearSelectedBookmark = useSetAtom(clearSelectedBookmarkAtom)

  const sorter = useBookmarkSorter(bookmarks)

  const reset = useSetAtom(bookmarkMutationAtoms.clearBookmarksAtom)
  const updateGroupOrder = useSetAtom(
    bookmarkMutationAtoms.updateGroupOrderAtom,
  )
  const removeBookmark = useSetAtom(bookmarkMutationAtoms.removeBookmarkAtom)

  function promptUpdateBookmark(bk: Bookmark) {
    setBookmarkPromptType('update-bookmark')
    setSelectedBookmark(bk)
    setShowBkPrompt(true)
  }

  function promptNewBookmark() {
    setBookmarkPromptType('new-bookmark')
    clearSelectedBookmark()
    setShowBkPrompt(true)
  }

  function promptNewGroup() {
    setBookmarkPromptType('new-group')
    clearSelectedBookmark()
    setShowBkPrompt(true)
  }

  function promptRemoveGroup() {
    setBookmarkPromptType('remove-group')
    setShowBkPrompt(true)
  }

  function promptUpdateGroup() {
    setBookmarkPromptType('update-group')
    setShowBkPrompt(true)
  }

  const commands: Command[] = [
    {
      action: () => {
        promptNewBookmark()
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    // { action: removeBookmark, name: 'remove bookmark' },
    // looks like we'll handle both of these from search
    // { action: updateBookmark, name: 'update bookmark' },
    {
      action: () => {
        promptNewGroup()
      },
      name: 'add group',
      hotKey: 'jj',
    },
    {
      action: () => {
        promptRemoveGroup()
      },
      name: 'remove group',
      hotKey: 'dd',
    },
    {
      action: () => {
        promptUpdateGroup()
      },
      name: 'update group',
      hotKey: 'uu',
    },
    // TODO: rename group
  ]

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
    <div className="NewTab">
      <div className="selected-bookmark" style={{ display: 'none' }}>
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
            setBookmarkPromptType('new-bookmark')
            clearSelectedBookmark()
            setShowBkPrompt(true)
          }}
        >
          add bookmark
        </button>
        <button
          onClick={() => {
            setBookmarkPromptType('new-group')
            clearSelectedBookmark()
            setShowBkPrompt(true)
          }}
        >
          add group
        </button>
      </TopContextRow>

      {showSearch ? (
        <Search
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          promptUpdateBookmark={promptUpdateBookmark}
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
                return (
                  <div key={`${groupName}-${index}-${i}`}>
                    {!sameAsLast || isFirst ? (
                      <div>
                        <div
                          className={cn(
                            'bookmark-group',
                            'flex gap-1 items-center',
                          )}
                        >
                          <GenericHeader text={groupName} />
                          <PopOutMenu
                            focusOnMount={isEmptyGroup}
                            menuStyles={{
                              bottom: isFirst ? '-4.5rem' : '-3.15rem',
                              width: '8.5rem',
                            }}
                          >
                            <IconButton
                              icon={<Add />}
                              clickHandler={() => {
                                const holding = {
                                  ...entry,
                                  id: 0,
                                  text: '',
                                  href: '',
                                }
                                console.log('set selected', holding)
                                setSelectedBookmark(holding)
                                setBookmarkPromptType('new-bookmark')
                                setShowBkPrompt(true)
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
                                  col: entry.col,
                                })
                              }}
                            >
                              add group
                            </IconButton>
                            <IconButton
                              icon={<Edit />}
                              clickHandler={() => {
                                setSelectedBookmark({ ...entry })
                                promptUpdateGroup()
                              }}
                            >
                              update group
                            </IconButton>
                            <IconButton
                              icon={<RemoveCircle />}
                              clickHandler={() => {
                                setSelectedBookmark({
                                  ...EMPTY_BOOKMARK,
                                  col: entry.col,
                                  group: entry.group,
                                })
                                promptRemoveGroup()
                              }}
                            >
                              remove group
                            </IconButton>

                            <IconButton
                              icon={<ArrowDownCircle />}
                              clickHandler={() =>
                                updateGroupOrder(groupName, index + 1, 'lower')
                              }
                            >
                              move group down
                            </IconButton>
                            <IconButton
                              icon={<ArrowUpCircle />}
                              clickHandler={() =>
                                updateGroupOrder(groupName, index + 1, 'raise')
                              }
                            >
                              move group up
                            </IconButton>
                          </PopOutMenu>
                        </div>
                      </div>
                    ) : null}
                    {!isEmptyBookmark(entry) && (
                      <BookmarkEntry
                        bookmark={entry}
                        showBookmarkPrompt={setShowBkPrompt}
                        removeBookmark={removeBookmark}
                        setBookmarkPromptType={setBookmarkPromptType}
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
