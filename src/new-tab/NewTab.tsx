import {
  PropsWithChildren,
  ReactElement,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search'
import './NewTab.css'
import useBookmarkController from './useBookmarkController'
import BookmarkPrompt from './BookmarkPrompt'
import { Bookmark } from '../background'
import useBookmarkSorter from './useBookmarkSorter'
import ArrowDownCircle from '../components/Icons/ArrowDownCircle'
import Add from '../components/Icons/Add'
import AddCircle from '../components/Icons/AddCircle'
import ArrowUpCircle from '../components/Icons/ArrowUpCircle'
import DotsHorizontal from '../components/Icons/DotsHorizontal'
import PopOutMenu from './PopOutMenu'
import Edit from '../components/Icons/Edit'
import CloseCircle from '../components/Icons/CloseCircle'
import Refresh from '../components/Icons/Refresh'
import { useTrackFocus } from './useTrackFocus'

type Bookmarks = typeof bookmarksJson

export const EMPTY_BOOKMARK: Bookmark = {
  id: 0,
  group: '',
  groupIndex: 0,
  col: 0,
  href: '',
  text: '',
}

// const bookmarks = (await chrome.storage.local.get('bookmarks'))
//   .bookmarks as Bookmarks

export default function NewTab() {
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)

  const [selectedBk, setSelectedBk] = useState<Bookmark>({ ...EMPTY_BOOKMARK })

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

  const { sortedColumns, groupNames } = useBookmarkSorter(bookmarks)

  const { focusPreviousElement } = useTrackFocus()

  function isEmptyBookmark(bookmark: Bookmark) {
    return !Boolean(bookmark.href) && !Boolean(bookmark.text)
  }

  useMemo(() => {
    console.log(selectedBk)
  }, [selectedBk])

  useEffect(() => {
    function keydownHandler(event: KeyboardEvent) {
      const { key, metaKey } = event
      if (key === 'k' && metaKey) {
        setShowSearch(true)
      }
    }
    document.addEventListener('keydown', keydownHandler)
  }, [])

  return (
    <div className="NewTab">
      <button
        onClick={() => {
          reset()
          updateRecentLinks('', '', true)
        }}
      >
        reset
      </button>
      <button onClick={focusPreviousElement}>focus previous</button>
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
          isShown={showBkPrompt}
          setIsShown={setShowBkPrompt}
          groupNames={groupNames}
          bookmark={selectedBk}
          setBookmark={setSelectedBk}
          addBookmark={addBookmark}
          updateBookmark={updateBookmark}
        />
      ) : null}
      <div className="bookmark-groups">
        {sortedColumns.map((col, index) => (
          <div key={'col-' + index}>
            <div>
              {col.map((entry, i) => {
                const isFirst = i === 0
                const groupName = entry.group
                const previousGroupName = col.at(i - 1)?.group
                const sameAsLast = previousGroupName === groupName
                return (
                  <div key={`${groupName}-${index}-${i}`}>
                    {!sameAsLast || isFirst ? (
                      <div>
                        <div className="bookmark-group">
                          <h2>{groupName}</h2>
                          <PopOutMenu
                            menuStyles={{
                              bottom: isFirst ? '-4.5rem' : '-3.15rem',
                              width: '8.5rem',
                            }}
                          >
                            {isFirst && (
                              <IconButton
                                icon={<AddCircle />}
                                clickHandler={() => {
                                  const name = prompt(
                                    'whats the new group name?',
                                  )
                                  addGroup(
                                    name ?? '',
                                    entry.groupIndex + 1,
                                    entry.col,
                                  )
                                }}
                              >
                                add group
                              </IconButton>
                            )}
                            <IconButton
                              icon={<Add />}
                              clickHandler={() => {
                                setSelectedBk({
                                  ...entry,
                                  id: 0,
                                  text: '',
                                  href: '',
                                })
                                setShowBkPrompt(true)
                              }}
                            >
                              add bookmark
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

export function IconButton({
  children,
  icon,
  clickHandler,
}: { icon: React.ReactNode; clickHandler: () => void } & PropsWithChildren) {
  return (
    <button className="icon-button" onClick={clickHandler}>
      {icon}
      {children}
    </button>
  )
}
