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

  const { bookmarks, addBookmark, removeBookmark, updateBookmark, reset } =
    useBookmarkController()

  const { bookmarkColumns } = useMemo(() => {
    const columns = [...new Set(bookmarks.map((bk) => bk.col))]
    const bookmarkColumns = columns.map((col) =>
      bookmarks
        .filter((bk) => bk.col === col)
        .sort((a, b) => a.group.length - b.group.length)
    )
    console.log(bookmarkColumns)
    return { bookmarkColumns, columns }
  }, [bookmarks])
  return (
    <div className="NewTab">
      <button onClick={() => reset()}>reset</button>
      <Search
        bookmarks={bookmarks}
        showSearch={showSearch}
        setShowSearch={setShowSearch}
      />
      <div className="bookmark-groups">
        {bookmarkColumns.map((col, index) => (
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
                      </div>
                    ) : null}
                    <>
                      <BookmarkEntry {...entry} key={'bookmark-entry-' + i} />
                      <button onClick={() => addBookmark(entry)}>add</button>
                      <button onClick={() => removeBookmark(entry)}>
                        remove
                      </button>
                      <button
                        onClick={() =>
                          updateBookmark({ ...entry, text: 'UPDATED' })
                        }
                      >
                        update
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
