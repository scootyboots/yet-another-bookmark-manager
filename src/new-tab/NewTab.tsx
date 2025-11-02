import { useMemo, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search'
import './NewTab.css'
import useBookmarkController from './useBookmarkController'

type Bookmarks = typeof bookmarksJson

// const bookmarks = (await chrome.storage.local.get('bookmarks'))
//   .bookmarks as Bookmarks

export default function NewTab() {
  const [showSearch, setShowSearch] = useState(true)

  const {
    bookmarks: bookmarksFromHook,
    addBookmark,
    removeBookmark,
    updateBookmark,
    reset,
  } = useBookmarkController()

  const { linksByGroup, columnsWithBookmarks } = useMemo(() => {
    const groups = bookmarksFromHook.map((book) => book.group)
    const uniqueGroups = [...new Set(groups)]
    const linksByGroup = uniqueGroups.map((group) =>
      bookmarksFromHook.filter((book) => book.group === group)
    )
    const columns = [...new Set(bookmarksFromHook.map((book) => book.col))]
    const columnsWithBookmarks = columns.map((col) =>
      bookmarksFromHook.filter((book) => book.col === col)
    )
    return { linksByGroup, columnsWithBookmarks }
  }, [bookmarksFromHook])
  return (
    <div className="NewTab">
      <button onClick={() => reset()}>reset</button>
      <Search
        bookmarks={bookmarksFromHook}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
      />
      <div className="bookmark-groups">
        {columnsWithBookmarks.map((col, index) => (
          <div key={'col-' + index}>
            <div>
              {col.map((entry, i) => {
                const isFirst = i === 0
                // const isFirst = true
                const groupName = entry.group
                const previousGroupName = col.at(i - 1)?.group
                const sameAsLast = previousGroupName === groupName
                return (
                  <div key={`${groupName}-${index}-${i}`}>
                    {!sameAsLast || isFirst ? (
                      <div>
                        <h2>{groupName}</h2>
                      </div>
                    ) : null}
                    <>
                      <BookmarkEntry {...entry} key={'bookmark-entry-' + i} />
                      <button onClick={() => addBookmark(entry)}>add</button>
                      <button onClick={() => removeBookmark(entry)}>
                        remove
                      </button>
                    </>
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
