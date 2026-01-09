import { useEffect, useMemo, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search'
import './NewTab.css'
import useBookmarkController from './useBookmarkController'
import BookmarkPrompt from './BookmarkPrompt'
import { Bookmark } from '../background'
import useBookmarkSorter from './useBookmarkSorter'

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
    addBookmark,
    removeBookmark,
    updateBookmark,
    updateGroupOrder,
    addGroup,
    reset,
  } = useBookmarkController()

  const { sortedColumns, groupNames } = useBookmarkSorter(bookmarks)

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
      <button onClick={() => reset()}>reset</button>
      {showSearch ? (
        <Search
          bookmarks={bookmarks}
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
                        <h2>{groupName}</h2>
                        {isFirst && (
                          <button
                            onClick={() => {
                              const name = prompt('whats the new group name?')
                              addGroup(
                                name ?? '',
                                entry.groupIndex + 1,
                                entry.col
                              )
                            }}
                          >
                            add group
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedBk({
                              ...entry,
                              id: 0,
                              text: '',
                              href: '',
                            })
                            setShowBkPrompt(true)
                          }}
                        >
                          add bk
                        </button>
                        <button
                          onClick={() => {
                            updateGroupOrder(groupName, index + 1, 'lower')
                          }}
                        >
                          down
                        </button>
                        <button
                          onClick={() => {
                            updateGroupOrder(groupName, index + 1, 'raise')
                          }}
                        >
                          up
                        </button>
                      </div>
                    ) : null}
                    {!isEmptyBookmark(entry) && (
                      <>
                        <BookmarkEntry {...entry} key={'bookmark-entry-' + i} />
                        <button onClick={() => removeBookmark(entry)}>
                          remove
                        </button>
                        <button
                          onClick={() => {
                            setSelectedBk({ ...entry })
                            setShowBkPrompt(true)
                          }}
                        >
                          update
                        </button>
                      </>
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
