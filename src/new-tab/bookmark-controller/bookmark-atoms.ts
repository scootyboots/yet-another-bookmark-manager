import {
  addBookmark,
  addGroup,
  Bookmark,
  getStoredBookmarks,
  getStoredRecentLinks,
  RecentLinks,
  removeBookmark,
  removeGroup,
  updateBookmark,
  updateGroupName,
  updateGroupOrder,
} from '@/background'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const bookmarksAtom = atom<Bookmark[]>([])
export const recentLinksAtom = atom<RecentLinks[]>([])

export const refreshBookmarksFromStorageAtom = atom(null, async (_get, set) => {
  const { data: bookmarks } = await getStoredBookmarks()
  set(bookmarksAtom, bookmarks ?? [])
})

export const refreshRecentLinksFromStorageAtom = atom(
  null,
  async (_get, set) => {
    const { data: recentLinks } = await getStoredRecentLinks()
    set(recentLinksAtom, recentLinks ?? [])
  },
)

export const initializeBookmarkAtomsAtom = atom(null, async (_get, set) => {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: recentLinks } = await getStoredRecentLinks()
  set(bookmarksAtom, bookmarks ?? [])
  set(recentLinksAtom, recentLinks ?? [])
})

export function useInitializeBookmarks() {
  const init = useSetAtom(initializeBookmarkAtomsAtom)
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
    await set(refreshBookmarksFromStorageAtom)
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
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const updateBookmarkAtom = atom(
  null,
  async (_get, set, bookmark: Bookmark) => {
    const { error } = await updateBookmark(bookmark)
    if (error) {
      console.log(error)
      return
    }
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const updateGroupOrderAtom = atom(
  null,
  async (
    _get,
    set,
    groupName: string,
    columnNumber: number,
    change: 'raise' | 'lower',
  ) => {
    const { error } = await updateGroupOrder(groupName, columnNumber, change)
    if (error) {
      console.log(error)
      return
    }
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const addGroupAtom = atom(
  null,
  async (_get, set, groupName: string, groupIndex: number, col: number) => {
    const { error } = await addGroup(groupName, groupIndex, col)
    if (error) {
      console.log(error)
      return
    }
    // TODO: check if we want to do this for this update
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const removeGroupAtom = atom(
  null,
  async (_get, set, groupName: string) => {
    const { error } = await removeGroup(groupName)
    if (error) {
      console.log(error)
      return
    }
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const updateGroupNameAtom = atom(
  null,
  async (_get, set, groupName: string, nextName: string) => {
    await updateGroupName(groupName, nextName)
    await set(refreshBookmarksFromStorageAtom)
  },
)

export const bookmarkMutations = {
  addBookmarkAtom,
  removeBookmarkAtom,
  updateBookmarkAtom,
  updateGroupOrderAtom,
  addGroupAtom,
  removeGroupAtom,
  updateGroupNameAtom,
}
