import {
  addBookmark,
  Bookmark,
  getStoredBookmarks,
  getStoredRecentLinks,
  RecentLinks,
  removeBookmark,
} from '@/background'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'
import { EMPTY_BOOKMARK } from '../NewTab'

export const bookmarksAtom = atom<Bookmark[]>([])
export const recentLinksAtom = atom<RecentLinks[]>([])

export const setBookmarksFromStorageAtom = atom(null, async (_get, set) => {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: recentLinks } = await getStoredRecentLinks()
  set(bookmarksAtom, bookmarks ?? [])
  set(recentLinksAtom, recentLinks ?? [])
})

export function useInitializeBookmarks() {
  const init = useSetAtom(setBookmarksFromStorageAtom)
  useEffect(() => {
    init()
  }, [])
}

export const addBookmarkAtom = atom(
  null,
  async (_get, set, bookmark: Bookmark) => {
    const { error } = await addBookmark(bookmark)
    if (error) {
      console.log(error)
      return
    }
    await set(setBookmarksFromStorageAtom)
  },
)

export const removeBookmarkAtom = atom(
  null,
  async (_get, set, bookmark: Bookmark) => {
    const { error } = await removeBookmark(bookmark)
    if (error) {
      console.log(error)
      return
    }
    set(setBookmarksFromStorageAtom)
  },
)
