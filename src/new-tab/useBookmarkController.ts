import { useState, useMemo, useCallback } from 'react'
import {
  getStoredBookmarks,
  addBookmark,
  removeBookmark,
  updateBookmark,
  Bookmark,
  resetBookmarks,
} from '../background'

type StoredResult = Awaited<ReturnType<typeof getStoredBookmarks>>

type ChangeResult = Awaited<
  ReturnType<
    | typeof addBookmark
    | typeof removeBookmark
    | typeof updateBookmark
    | typeof resetBookmarks
  >
>

export default function useBookmarkController() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useMemo(() => {
    getStoredBookmarks().then((stored) => {
      const { data } = stored
      if (data) setBookmarks(data)
    })
  }, [])

  useMemo(() => {
    console.log('stored this number of bookmarks: ', bookmarks?.length)
  }, [bookmarks])

  function handleBookmarksChange(result: ChangeResult) {
    if (!result.error) {
      getStoredBookmarks().then((stored) => {
        console.log('stored: ', stored)
        if (stored.data) setBookmarks(stored.data)
      })
    }
  }

  const handleAddBookmark = useCallback(
    (bookmark: Bookmark) => {
      console.log('tried to add', bookmark)
      addBookmark(bookmark).then(handleBookmarksChange)
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

  const handleReset = useCallback(() => {
    resetBookmarks().then(handleBookmarksChange)
  }, [bookmarks])

  return {
    bookmarks,
    addBookmark: handleAddBookmark,
    removeBookmark: handleRemoveBookmark,
    updateBookmark: handleUpdateBookmark,
    reset: handleReset,
  }
}
