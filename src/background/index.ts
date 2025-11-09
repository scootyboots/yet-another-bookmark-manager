import bookmarks from '../../public/bookmarks-backup.json'

export type BookmarksBackup = typeof bookmarks
export type Bookmark = BookmarksBackup[number] & { id: number }
export type NewBookmark = Omit<Bookmark, 'id'>
export type Bookmarks = Array<Bookmark>

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'main.html' })
})

function addIdsToBookmarks(bookmarks: BookmarksBackup) {
  // const columns = [...new Set([...bookmarks.map((bk) => bk.col)])]
  // const columnGroups = columns.map((col, index) => ({
  //   col,
  //   numberOfGroups: new Set([...bookmarks.filter((bk) => bk.col === col)]).size,
  // }))

  let initialId = 1000

  const bookmarksWithId = bookmarks.map((bk) => {
    initialId += 1
    return { ...bk, id: initialId }
  })
  return { bookmarksWithId, lastId: initialId }
}

chrome.runtime.onInstalled.addListener(() => {
  const { bookmarksWithId, lastId } = addIdsToBookmarks(bookmarks)
  chrome.storage.local.set({
    bookmarks: bookmarksWithId,
    lastId,
  })
})

function makeAddRemoveMessage(
  type: 'add' | 'remove' | 'update',
  bookmark: Bookmark
) {
  return `${type}-ed bookmark
    group: ${bookmark.group}
    col: ${bookmark.col}
    href: ${bookmark.href}
    text: ${bookmark.text}
    `
}

export async function resetBookmarks() {
  const { bookmarksWithId, lastId } = addIdsToBookmarks(bookmarks)
  await chrome.storage.local.set({ bookmarks: bookmarksWithId, lastId })
  return { data: 'reset bookmarks', error: null }
}

export async function storeBookmarks(bookmarks: Bookmarks) {
  return await chrome.storage.local.set({ bookmarks })
}

export async function getStoredBookmarks() {
  const stored = await chrome.storage.local.get<{ bookmarks: Bookmarks }>(
    'bookmarks'
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

export async function addBookmark(newBookmark: NewBookmark) {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: lastId } = await getStoredLastId()
  if (bookmarks && lastId) {
    const updatedLastId = lastId + 1
    const newBookmarkWithId = { ...newBookmark, id: updatedLastId }
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
  return { data: makeAddRemoveMessage('remove', existingBookmark) }
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
  change: 'raise' | 'lower'
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
    '\n\n\n----- UPDATE GROUP ORDER -----'
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
  // bookmarks.splice(columnNumber - 1, updatedColumn.length, ...updatedColumn)
  await storeBookmarks(updatedBookmarks)
  return { data: 'updated bookmark order for: ' + groupName, error: null }
}
