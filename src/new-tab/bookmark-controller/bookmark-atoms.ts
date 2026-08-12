import {
  addBookmark,
  addGroup,
  Bookmark,
  getStoredBookmarks,
  getStoredRecentLinks,
  removeBookmark,
  removeGroup,
  resetBookmarks,
  updateBookmark,
  updateGroupName,
  updateGroupOrder,
  updateRecentLinks,
  increaseOpenCount,
  Filter,
  getStoredFilters,
  updateFilter,
  INITIAL_FILTER_ID,
  updateFilters,
  Filters,
} from '@/background'
import { atom } from 'jotai'

export const EMPTY_BOOKMARK: Bookmark = {
  id: 0,
  group: '',
  groupIndex: 0,
  col: 1,
  href: '',
  text: '',
  tags: [],
  comment: '',
  openCount: 0,
  dateAdded: 0,
  dateFormatted: '',
} as const

export const EMPTY_FILTER: Filter = {
  id: 0,
  name: '',
  limit: 0,
  tags: [],
  query: '',
  bookmarks: [],
} as const

export const bookmarksAtom = atom<Bookmark[]>([])
export const recentLinksAtom = atom<Bookmark[]>([])
// TODO: break filters into default and user
export const filtersAtom = atom<Filters>({
  preset: [],
  user: [],
})
export const filterDefaultsSetAtom = atom(null, async (get, set) => {
  const { data: storedFilters } = await getStoredFilters()
  if (!storedFilters) {
    return
  }
  const mostVisited = get(mostVisitedBookmarksReadOnlyAtom)
  const newest = get(bookmarksNewestToOldestReadOnlyAtom)
  const recentLinks = get(recentLinksAtom)
  const presetFilters = storedFilters?.preset
  const updated = presetFilters?.map((f) => {
    if (f.id === INITIAL_FILTER_ID) {
      return { ...f, bookmarks: newest }
    }
    if (f.id === INITIAL_FILTER_ID + 1) {
      return { ...f, bookmarks: mostVisited }
    }
    if (f.id === INITIAL_FILTER_ID + 1 + 1) {
      return { ...f, bookmarks: recentLinks }
    }
    return f
  })
  await updateFilters({ preset: updated, user: storedFilters.user })
  set(refreshFiltersFromStorageAtom)
})
export const mostVisitedBookmarksReadOnlyAtom = atom<Bookmark[]>((get) => {
  const bookmarks = get(bookmarksAtom)
  const sorted = [...bookmarks].sort((a, b) => b.openCount - a.openCount)
  return sorted.filter((bk) => bk.openCount)
})
export const bookmarksNewestToOldestReadOnlyAtom = atom<Bookmark[]>((get) => {
  const bookmarks = get(bookmarksAtom)
  const sorted = [...bookmarks].sort((a, b) => b.id - a.id)
  return sorted
})

export const suggestedBookmarksAtoms = atom<Bookmark[]>((get) => {
  const mostVisited = get(mostVisitedBookmarksReadOnlyAtom)
  const recentLinks = get(recentLinksAtom)
  const mixedLinks: Bookmark[] = []
  for (let index = 0; index < mostVisited.length; index++) {
    if (index >= 20) {
      break
    }
    const pushedIds = mixedLinks.map((bk) => bk.id)
    const mostVisitedBookmark = mostVisited.find(
      (bk) => !pushedIds.includes(bk.id),
    )
    const recentLink = recentLinks.find((bk) => !pushedIds.includes(bk.id))
    const isEven = index % 2 === 0
    if (index === 0 || isEven) {
      const toPush = recentLink ?? mostVisitedBookmark
      if (toPush) {
        mixedLinks.push(toPush)
      }
    } else {
      if (mostVisitedBookmark) {
        mixedLinks.push(mostVisitedBookmark)
      }
    }
  }
  return mixedLinks
})

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

export const updateFilterAtom = atom(null, async (get, set, filter: Filter) => {
  await updateFilter(filter)
  set(refreshFiltersFromStorageAtom)
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

export const refreshFiltersFromStorageAtom = atom(null, async (_get, set) => {
  const { data: filters } = await getStoredFilters()
  set(filtersAtom, filters ?? { preset: [], user: [] })
})

export const initializeBookmarkAtomsAtom = atom(null, async (_get, set) => {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: recentLinks } = await getStoredRecentLinks()
  const { data: filters } = await getStoredFilters()
  set(bookmarksAtom, bookmarks ?? [])
  set(recentLinksAtom, recentLinks ?? [])
  set(filtersAtom, filters ?? { preset: [], user: [] })
})

export const updateRecentLinksAtom = atom(
  null,
  async (_get, set, bookmark: Bookmark, clear?: boolean) => {
    await updateRecentLinks(bookmark, clear)
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

export const increaseOpenCountAtom = atom(
  null,
  async (_get, set, bookmark: Bookmark) => {
    const { error } = await increaseOpenCount(bookmark)
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
  increaseOpenCountAtom,
}

export const showSearchAtom = atom<boolean>(true)
export const showSearchSetAtom = atom(null, (_get, set, isShown: boolean) => {
  set(showSearchAtom, isShown)
})

export const showCommandLineAtom = atom<boolean>(false)
export const showCommandLineSetAtom = atom(
  null,
  (_get, set, isShown: boolean) => {
    set(showCommandLineAtom, isShown)
  },
)

export const showPromptAtom = atom<boolean>(false)
export const showPromptSetAtom = atom(null, (_get, set, isShown: boolean) => {
  set(showPromptAtom, isShown)
})

export const newBookmarkPromptSetAtom = atom(
  null,
  (_get, set, groupName?: string) => {
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
