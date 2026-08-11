import { EMPTY_BOOKMARK } from '../new-tab/bookmark-controller/bookmark-atoms'

export type Bookmark = {
  id: number
  href: string
  text: string
  col: number
  group: string
  groupIndex: number
  tags: string[]
  comment: string
  openCount: number
  dateAdded: number
  dateFormatted: string
}
export type NewBookmark = Omit<Bookmark, 'id'>
export type Bookmarks = Array<Bookmark>

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'newTab.html' })
})

export function formatDate(dateMs: number) {
  const date = new Date(dateMs)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDay()
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

function addIdsAndPropsToBookmarks(bookmarks: NewBookmark[]) {
  let initialId = 1000
  const date = Date.now()
  const bookmarksWithId = bookmarks.map((bk) => {
    initialId += 1
    return {
      ...bk,
      id: initialId,
      tags: [bk.group],
      comment: '',
      openCount: 0,
      dateAdded: date,
      dateFormatted: formatDate(date),
    }
  })
  return { bookmarksWithId, lastId: initialId }
}

const BOOKMARKS_BY_ID_KEY = 'bookmarksById'

export function makeBookmarksById(bookmarks: Bookmark[]) {
  const keyedBookmarks: Record<number, Bookmark> = {}
  for (const bk of bookmarks) {
    keyedBookmarks[bk.id] = bk
  }
  return keyedBookmarks
}

export async function storeBookmarksById(bookmarks: Bookmark[]) {
  const keyedBookmarks = makeBookmarksById(bookmarks)
  chrome.storage.local.set({ [BOOKMARKS_BY_ID_KEY]: keyedBookmarks })
}

export async function getBookmarksById() {
  return await chrome.storage.local.get<{
    [BOOKMARKS_BY_ID_KEY]: Record<number, Bookmark>
  }>(BOOKMARKS_BY_ID_KEY)
}

async function initializeBookmarks() {
  try {
    const backupUrl = chrome.runtime.getURL('bookmarks-backup.json')
    const personalUrl = chrome.runtime.getURL('bookmarks-personal.json')
    const responses = await Promise.all([fetch(backupUrl), fetch(personalUrl)])
    const data = (await Promise.all(
      responses.map((resp) => resp.json()),
    )) as Bookmark[][]
    const combined = data.flat()
    const { bookmarksWithId, lastId } = addIdsAndPropsToBookmarks(combined)
    chrome.storage.local.set({
      bookmarks: bookmarksWithId,
      bookmarksById: makeBookmarksById(bookmarksWithId),
      lastId,
      recentLinks: [],
      mostOpened: [],
    })
  } catch (e) {
    chrome.storage.local.set({
      bookmarks: [],
      bookmarksById: {},
      lastId: 1000,
      recentLinks: [],
      mostOpened: [],
    })
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  const isInstall = details.reason === 'install'
  const isUpdate = details.reason === 'update'

  if (isInstall) {
    await initializeBookmarks()
  }
})

function makeAddRemoveMessage(
  type: 'add' | 'remove' | 'update',
  bookmark: Bookmark,
) {
  return `${type}-ed bookmark
    group: ${bookmark.group}
    col: ${bookmark.col}
    href: ${bookmark.href}
    text: ${bookmark.text}
    `
}

export async function resetBookmarks() {
  await initializeBookmarks()
  return { data: 'reset bookmarks', error: null }
}

export async function storeBookmarks(bookmarks: Bookmarks) {
  await chrome.storage.local.set({ bookmarks })
  await storeBookmarksById(bookmarks)
}

export async function getStoredBookmarks() {
  const stored = await chrome.storage.local.get<{ bookmarks: Bookmarks }>(
    'bookmarks',
  )
  if (stored?.bookmarks) return { data: stored?.bookmarks, error: null }

  return { data: null, error: 'did not find any stored bookmarks' }
}

export async function storeLastId(id: number) {
  await chrome.storage.local.set({ lastId: id })
}

export async function getStoredLastId() {
  const stored = await chrome.storage.local.get<{ lastId: number }>('lastId')
  if (stored?.lastId) return { data: stored?.lastId, error: null }
  return { data: null, error: 'did not find stored lastId' }
}

export async function getStoredRecentLinks() {
  const stored = await chrome.storage.local.get<{
    recentLinks: Array<Bookmark>
  }>('recentLinks')
  const { recentLinks } = stored
  if (recentLinks) return { data: recentLinks, error: null }
  await chrome.storage.local.set({ recentLinks: [] })
  return { data: null, error: 'did not find stored recent links' }
}

export async function updateRecentLinks(bk: Bookmark, clear?: boolean) {
  if (clear) {
    return await chrome.storage.local.set({ recentLinks: [] })
  }
  const { data: recentLinks } = await getStoredRecentLinks()
  const { bookmarksById } = await getBookmarksById()
  if (!recentLinks) return
  recentLinks.unshift(bk)
  const uniqueIds = [...new Set(recentLinks.map((bk) => bk.id))]
  const uniqueBookmarks = uniqueIds.map((id) => bookmarksById[id])
  const capped = uniqueBookmarks.slice(0, 25)
  await chrome.storage.local.set({ recentLinks: capped })
}

export async function addGroup(name: string, groupIndex: number, col: number) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (bookmarks) {
    await storeBookmarks([
      ...bookmarks,
      { ...EMPTY_BOOKMARK, group: name, groupIndex, col },
    ])
    return { data: 'added new group name: ' + name, error: null }
  }
  return { data: null, error: 'failed to pull in exiting bookmarks' }
}

// type Group = { name: string; groupIndex: number; col: number }

// function checkTargetGroup(group: Group, bk: Bookmark) {
//   return (
//     bk.group === group.name &&
//     bk.groupIndex === group.groupIndex &&
//     bk.col === group.col
//   )
// }

export async function removeGroup(groupName: string) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (bookmarks) {
    const removed = bookmarks.filter((bk) => {
      const isTargetBookmark = bk.group === groupName
      return !isTargetBookmark
    })
    await storeBookmarks(removed)
    return { data: 'BACKGROUND removed group: ' + groupName, error: null }
  }
  return { data: null, error: 'failed to pull in existing bookmarks' }
}

export async function updateGroupName(groupName: string, next: string) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (bookmarks) {
    await storeBookmarks(
      bookmarks.map((bk) => {
        if (bk.group === groupName) {
          return { ...bk, group: next }
        }
        return bk
      }),
    )
    // return {data: 'update', error: 'null'}
  }
  return { data: null, error: 'failed to pull in existing group bookmarks' }
}

// TODO: revisit this logic
export async function joinGroups(
  groupA: string,
  groupB: string,
  newName?: string,
) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (bookmarks) {
    const firstGroupA = bookmarks.find((bk) => groupA === bk.group) as Bookmark
    const newGroupTemplate = {
      ...firstGroupA,
      group: newName ?? firstGroupA?.group ?? '',
    }

    const updated = bookmarks.map((bk) => {
      const isGroupA = groupA === bk.group
      const isGroupB = groupB === bk.group
      if (isGroupA) {
        const nameToUse = newName ?? bk.group
        return { ...bk, group: nameToUse }
      }
      if (isGroupB) {
        return { ...newGroupTemplate, href: bk.href, text: bk.text }
      }
      return bk
    })
    await storeBookmarks(updated)
    return { data: `joined groups: ${groupA} and ${groupB}` }
  }
  return { data: null, error: 'failed to pull in existing bookmarks' }
}

export async function addBookmark(newBookmark: NewBookmark) {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: lastId } = await getStoredLastId()
  if (bookmarks && lastId) {
    const updatedLastId = lastId + 1
    const now = Date.now()
    const newBookmarkWithId = {
      ...newBookmark,
      id: updatedLastId,
      dateAdded: now,
      dateFormatted: formatDate(now),
    } satisfies Bookmark
    await storeBookmarks([newBookmarkWithId, ...bookmarks])
    await storeLastId(updatedLastId)
    return { data: makeAddRemoveMessage('add', newBookmarkWithId), error: null }
  }
  return { data: null, error: 'failed to pull in existing bookmarks' }
}

export async function removeBookmark(existingBookmark: Bookmark) {
  const { id } = existingBookmark
  const { data: bookmarks } = await getStoredBookmarks()
  if (!bookmarks)
    return {
      data: null,
      error:
        'failed to pull in stored bookmarks when trying to remove this bookmark:',
      existingBookmark,
    }

  const removedExisting = bookmarks.filter((bk) => bk.id !== id)
  await storeBookmarks(removedExisting)
  return { data: makeAddRemoveMessage('remove', existingBookmark), error: null }
}

export async function updateBookmark(bookmarkToUpdate: Bookmark) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (!bookmarks) {
    return {
      data: null,
      error: 'failed to pull in stored bookmarks, updateBookmark',
    }
  }
  const updatedBookmarks = bookmarks.map((bk) => {
    if (bk.id === bookmarkToUpdate.id) {
      return bookmarkToUpdate
    }
    return bk
  })

  await storeBookmarks(updatedBookmarks)
  return { data: 'updated bookmark id: ' + bookmarkToUpdate.id, error: null }
}

export async function updateGroupOrder(
  groupName: string,
  columnNumber: number,
  change: 'raise' | 'lower',
) {
  const { data: bookmarks } = await getStoredBookmarks()
  if (!bookmarks) {
    return {
      data: null,
      error: 'failed to pull in stored bookmarks updateGroupOrder',
    }
  }
  console.log(
    '----- UPDATE GROUP ORDER -----\n\n\n',
    groupName,
    columnNumber,
    change,
    '\n\n\n----- UPDATE GROUP ORDER -----',
  )
  const isRaiseTargetGroup = change === 'raise'

  const column = bookmarks.filter((bk) => bk.col === columnNumber)
  const remainingColumns = bookmarks.filter((bk) => bk.col !== columnNumber)

  const uniqueGroups = new Set([...column.map((bk) => bk.group)])
  const numberOfGroupsInColumn = uniqueGroups.size

  const targetGroup = column.filter((bk) => bk.group === groupName)
  const remainingGroups = column.filter((bk) => bk.group !== groupName)

  const updateTargetGroup = () => {
    let isTargetIndexChanged = true
    let prevIndex = 0
    let updatedIndex = 0
    const updatedGroup = targetGroup.map((bk) => {
      prevIndex = bk.groupIndex
      const raisedIndex = bk.groupIndex + 1
      const loweredIndex = bk.groupIndex - 1
      const isMaxIndex = bk.groupIndex === numberOfGroupsInColumn - 1
      const isLastIndex = bk.groupIndex === 0
      if (isRaiseTargetGroup) {
        if (isMaxIndex) {
          return bk
        }

        updatedIndex = raisedIndex
        return { ...bk, groupIndex: raisedIndex }
      } else {
        if (isLastIndex) {
          return bk
        }
        updatedIndex = loweredIndex
        return { ...bk, groupIndex: loweredIndex }
      }
    })
    return { updatedGroup, isTargetIndexChanged, prevIndex, updatedIndex }
  }

  const { updatedGroup, prevIndex, updatedIndex, isTargetIndexChanged } =
    updateTargetGroup()

  // const isTargetIndexChanged = Boolean(prevIndex === updatedIndex)

  const updateRemainingGroups = () => {
    if (!isTargetIndexChanged) return remainingGroups
    return remainingGroups.map((bk) => {
      const raisedIndex = bk.groupIndex + 1
      const loweredIndex = bk.groupIndex - 1
      const updateNotTargetIndex = () => {
        console.log(updatedIndex)
        if (updatedIndex === bk.groupIndex) {
          console.log('MATCHING INDEX')
          return isRaiseTargetGroup ? loweredIndex : raisedIndex
        }
        return bk.groupIndex
      }
      return {
        ...bk,
        groupIndex: updateNotTargetIndex(),
      }
    })
  }

  const updatedRemainingGroups = updateRemainingGroups()

  const updatedColumn = [...updatedGroup, ...updatedRemainingGroups]

  const updatedBookmarks = [...updatedColumn, ...remainingColumns]

  await storeBookmarks(updatedBookmarks)

  return { data: 'updated bookmark order for: ' + groupName, error: null }
}

export async function increaseOpenCount(bookmark: Bookmark) {
  const { data: bookmarks, error } = await getStoredBookmarks()
  if (!bookmarks) return { data: null, error }
  const updated = bookmarks.map((bk) => {
    if (bk.id === bookmark.id) {
      return { ...bk, openCount: bk.openCount + 1 }
    }
    return bk
  })
  await storeBookmarks(updated)
  await storeMostOpenedBookmarks()
  return { data: 'updated open count', error: null }
}

export async function getMostOpenedBookmarks() {
  const { data: bookmarks, error } = await getStoredBookmarks()
  if (!bookmarks) return { data: null, error }
  const sorted = [...bookmarks].sort((a, b) => b.openCount - a.openCount)
  const filteredZero = sorted.filter((bk) => bk.openCount)
  console.log('MOST OPENED UPDATED TO ', filteredZero)
  return { data: filteredZero, error: null }
}

export async function storeMostOpenedBookmarks() {
  const { data: sorted } = await getMostOpenedBookmarks()
  await chrome.storage.local.set({ mostOpened: sorted ?? [] })
}
