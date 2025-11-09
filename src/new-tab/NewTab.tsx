import { useMemo, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search'
import './NewTab.css'
import useBookmarkController from './useBookmarkController'
import BookmarkPrompt from './BookmarkPrompt'
import { Bookmark } from '../background'

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
  const [toUpdate, setToUpdate] = useState({ href: '', text: '' })
  const [updateType, setUpdateType] = useState<'add' | 'update'>('add')

  const [selectedBk, setSelectedBk] = useState<Bookmark>(EMPTY_BOOKMARK)

  const {
    bookmarks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    updateGroupOrder,
    reset,
  } = useBookmarkController()

  const { bookmarkColumns } = useMemo(() => {
    // const sortedByCol = bookmarks.sort((a, b) => b.col - a.col)
    const columns = [...new Set(bookmarks.map((bk) => bk.col))].sort(
      (a, b) => a - b
    )
    const bookmarkColumns = columns.map((col) =>
      bookmarks
        .filter((bk) => bk.col === col)
        // .sort((a, b) => a.group.length - b.group.length)
        .sort((a, b) => b.groupIndex - a.groupIndex)
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
      <BookmarkPrompt
        isShown={showBkPrompt}
        setIsShown={setShowBkPrompt}
        bookmark={selectedBk}
        type={updateType}
        setBookmark={setSelectedBk}
        addBookmark={addBookmark}
        updateBookmark={updateBookmark}
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
                        <button
                          onClick={() => {
                            // addBookmark({
                            //   href: 'placeholder href',
                            //   text: 'placeholder text',
                            //   group: groupName,
                            //   groupIndex: entry.groupIndex,
                            //   col: entry.col,
                            // })
                            setSelectedBk({
                              ...EMPTY_BOOKMARK,
                              group: groupName,
                              groupIndex: entry.groupIndex,
                              col: entry.col,
                            })
                            setUpdateType('add')
                            // setToUpdate({ href: '', text: '' })
                            setShowBkPrompt(true)
                          }}
                        >
                          add
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
                    <>
                      <BookmarkEntry {...entry} key={'bookmark-entry-' + i} />
                      <button onClick={() => removeBookmark(entry)}>
                        remove
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBk(entry)
                          setUpdateType('update')
                          // setToUpdate({ href: entry.href, text: entry.text })
                          setShowBkPrompt(true)
                          // updateBookmark({ ...entry, text: 'UPDATED' })
                        }}
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
