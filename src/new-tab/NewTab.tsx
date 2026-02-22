import { useEffect, useMemo, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search'
import './NewTab.css'
import useBookmarkController from './useBookmarkController'
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
import { checkPromptOpen } from './util'
import CommandLine from './CommandLine'

type Bookmarks = typeof bookmarksJson

export const EMPTY_BOOKMARK: Bookmark = {
  id: 0,
  group: '',
  groupIndex: 0,
  col: 1,
  href: '',
  text: '',
}

export default function NewTab() {
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const [selectedBk, setSelectedBk] = useState<Bookmark>({ ...EMPTY_BOOKMARK })
  const [bookmarkPromptType, setBookmarkPromptType] =
    useState<BookmarkPromptType>('new-bookmark')

  const {
    bookmarks,
    recentLinks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    updateGroupOrder,
    updateRecentLinks,
    addGroup,
    reset,
  } = useBookmarkController()

  const commands = [
    {
      action: () => {
        setBookmarkPromptType('new-bookmark')
        setSelectedBk({ ...EMPTY_BOOKMARK })
        setShowBkPrompt(true)
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    // { action: removeBookmark, name: 'remove bookmark' },
    // { action: updateBookmark, name: 'update bookmark' },
    {
      action: () => {
        setBookmarkPromptType('new-group')
        setSelectedBk({ ...EMPTY_BOOKMARK })
        setShowBkPrompt(true)
      },
      name: 'add group',
      hotKey: 'jj',
    },
    // TODO: update group / remove group
    // { action: setShowSearch, name: 'search' },
  ]

  const sorter = useBookmarkSorter(bookmarks)

  const { focusPreviousElement } = useTrackFocus()

  function isEmptyBookmark(bookmark: Bookmark) {
    return !Boolean(bookmark.href) && !Boolean(bookmark.text)
  }

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

  return (
    <div className="NewTab">
      <TopContextRow>
        <button
          onClick={() => {
            reset()
            updateRecentLinks('', '', true)
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
            setSelectedBk({ ...EMPTY_BOOKMARK })
            setShowBkPrompt(true)
          }}
        >
          add bookmark
        </button>
        <button
          onClick={() => {
            setBookmarkPromptType('new-group')
            setShowBkPrompt(true)
          }}
        >
          add group
        </button>
      </TopContextRow>

      {showSearch ? (
        <Search
          bookmarks={bookmarks}
          recentLinks={recentLinks}
          updateRecentLinks={updateRecentLinks}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
        />
      ) : null}

      {showBkPrompt ? (
        <BookmarkPrompt
          type={bookmarkPromptType}
          isShown={showBkPrompt}
          setIsShown={setShowBkPrompt}
          bookmark={selectedBk}
          setBookmark={setSelectedBk}
          addBookmark={addBookmark}
          updateBookmark={updateBookmark}
          addGroup={addGroup}
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
      <div className="bookmark-groups">
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
                        <div className="bookmark-group">
                          <h2>{groupName}</h2>
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
                                setSelectedBk({
                                  ...entry,
                                  id: 0,
                                  text: '',
                                  href: '',
                                })
                                setBookmarkPromptType('new-bookmark')
                                setShowBkPrompt(true)
                              }}
                            >
                              add bookmark
                            </IconButton>
                            <IconButton
                              icon={<AddCircle />}
                              clickHandler={() => {
                                // setSelectedBk({ ...entry })
                                // const name = prompt('whats the new group name?')
                                setBookmarkPromptType('new-group')
                                setShowBkPrompt(true)
                                // addGroup(
                                //   name ?? '',
                                //   entry.groupIndex + 1,
                                //   entry.col,
                                // )
                              }}
                            >
                              add group
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
                        selectBookmark={setSelectedBk}
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
