import { useState, useMemo, useCallback, useLayoutEffect } from 'react'
import {
  getStoredBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmark,
  Bookmark,
  resetBookmarks,
  updateGroupOrder,
  NewBookmark,
} from '../background'

type StoredResult = Awaited<ReturnType<typeof getStoredBookmarks>>

type ChangeResult = Awaited<
  ReturnType<
    | typeof addBookmark
    | typeof removeBookmark
    | typeof updateBookmark
    | typeof resetBookmarks
    | typeof updateGroupOrder
  >
>

export default function useBookmarkController() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useLayoutEffect(() => {
    getStoredBookmarks().then((stored) => {
      const { data } = stored
      if (data) {
        if (data.length > 0) {
          setBookmarks(data)
        }
      }
    })
  }, [])

  function handleBookmarksChange(result: ChangeResult) {
    if (!result.error) {
      getStoredBookmarks().then((stored) => {
        console.log('stored: ', stored)
        if (stored.data) setBookmarks(stored.data)
      })
    }
  }

  const handleAddBookmark = useCallback(
    (newBookmark: NewBookmark) => {
      console.log('tried to add', newBookmark)
      addBookmark(newBookmark).then(handleBookmarksChange)
    },
    [bookmarks]
  )

  const handleRemoveBookmark = useCallback(
    (bookmark: Bookmark) => {
      console.log('tried to remove', bookmark)
      removeBookmark(bookmark).then(handleBookmarksChange)
    },
    [bookmarks]
  )

  const handleUpdateBookmark = useCallback(
    (bookmark: Bookmark) => {
      console.log('tried to update', bookmark)
      updateBookmark(bookmark).then(handleBookmarksChange)
    },
    [bookmarks]
  )

  const handleUpdateGroupOrder = useCallback(
    (groupName: string, columnNumber: number, update: 'raise' | 'lower') => {
      updateGroupOrder(groupName, columnNumber, update).then(
        handleBookmarksChange
      )
    },
    [bookmarks]
  )

  const handleReset = useCallback(() => {
    resetBookmarks().then(handleBookmarksChange)
  }, [bookmarks])

  return {
    bookmarks,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    updateBookmark: handleUpdateBookmark,
    updateGroupOrder: handleUpdateGroupOrder,
    reset: handleReset,
  }
}
