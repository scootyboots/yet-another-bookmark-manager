import {
  addBookmark,
  addGroup,
  Bookmark,
  getStoredBookmarks,
  getStoredRecentLinks,
  RecentLinks,
  removeBookmark,
  removeGroup,
  resetBookmarks,
  updateBookmark,
  updateGroupName,
  updateGroupOrder,
  updateRecentLinks,
} from '@/background'
import { atom, useSetAtom } from 'jotai'
import { useEffect } from 'react'

export const EMPTY_BOOKMARK: Bookmark = {
  id: 0,
  group: '',
  groupIndex: 0,
  col: 1,
  href: '',
  text: '',
} as const

export const bookmarksAtom = atom<Bookmark[]>([])
export const recentLinksAtom = atom<RecentLinks[]>([])

export const selectedBookmarkAtom = atom<Bookmark>({ ...EMPTY_BOOKMARK })
export const clearSelectedBookmarkAtom = atom(null, (_get, set) => {
  set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK })
})
export const selectedBookmarkOnMountAtom = atom<Bookmark>({ ...EMPTY_BOOKMARK })
export const clearSelectedBookmarkOnMountAtom = atom(null, (_get, set) => {
  set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK })
})

export const refreshBookmarksFromStorageAtom = atom(null, async (_get, set) => {
  const { data: bookmarks } = await getStoredBookmarks()
  set(bookmarksAtom, bookmarks ?? [])
})

export const clearBookmarksAtom = atom(null, async (_get, set) => {
  await resetBookmarks()
  set(bookmarksAtom, [])
})

export type PromptCommands =
  | 'new-bookmark'
  | 'update-bookmark'
  | 'new-group'
  | 'update-group'
  | 'remove-group'
  | ''

export const promptCommandAtom = atom<PromptCommands>('')
export const setPromptCommandAtom = atom(
  null,
  (_get, set, command: PromptCommands) => {
    set(promptCommandAtom, command)
  },
)

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

export const updateRecentLinksAtom = atom(
  null,
  async (_get, set, url: string, text: string, clear: boolean) => {
    await updateRecentLinks(url, text, clear)
    await set(refreshRecentLinksFromStorageAtom)
  },
)

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

export const bookmarkMutationAtoms = {
  addBookmarkAtom,
  removeBookmarkAtom,
  updateBookmarkAtom,
  updateGroupOrderAtom,
  addGroupAtom,
  removeGroupAtom,
  updateGroupNameAtom,
  clearBookmarksAtom,
  updateRecentLinksAtom,
}

export const showPromptAtom = atom<boolean>(false)
export const showPromptSetAtom = atom(null, (_get, set, isShown: boolean) => {
  set(showPromptAtom, isShown)
})

export const newBookmarkPromptSetAtom = atom(
  null,
  (_get, set, groupName?: string) => {
    console.log('tried running new bookmark prompt set atom')
    set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK, group: groupName ?? '' })
    set(showPromptAtom, true)
    set(promptCommandAtom, 'new-bookmark')
  },
)

export const updateBookmarkPromptSetAtom = atom(
  null,
  (_get, set, bookmark: Bookmark) => {
    set(selectedBookmarkAtom, bookmark)
    set(showPromptAtom, true)
    set(promptCommandAtom, 'update-bookmark')
  },
)

export const newGroupPromptSetAtom = atom(
  null,
  (_get, set, colIndex?: number) => {
    set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK, col: colIndex ?? 0 })
    set(promptCommandAtom, 'new-group')
    set(showPromptAtom, true)
  },
)

export const removeGroupPromptSetAtom = atom(
  null,
  (_get, set, groupName?: string) => {
    set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK, group: groupName ?? '' })
    set(promptCommandAtom, 'remove-group')
    set(showPromptAtom, true)
  },
)

export const updateGroupPromptSetAtom = atom(
  null,
  (_get, set, groupName?: string) => {
    set(selectedBookmarkAtom, { ...EMPTY_BOOKMARK, group: groupName ?? '' })
    set(promptCommandAtom, 'update-group')
    set(showPromptAtom, true)
  },
)

export const promptSetAtoms = {
  newBookmark: newBookmarkPromptSetAtom,
  updateBookmark: updateBookmarkPromptSetAtom,
  newGroup: newGroupPromptSetAtom,
  removeGroup: removeGroupPromptSetAtom,
  updateGroup: updateGroupPromptSetAtom,
}
