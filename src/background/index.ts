import bookmarks from '../../public/bookmarks-backup.json'

export type BookmarksBackup = typeof bookmarks
export type Bookmark = BookmarksBackup[number] & { id: number }
export type Bookmarks = Array<Bookmark>

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'main.html' })
})

function addIdsToBookmarks(bookmarks: BookmarksBackup) {
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

export async function addBookmark(newBookmark: Bookmark) {
  const { data: bookmarks } = await getStoredBookmarks()
  const { data: lastId } = await getStoredLastId()
  if (bookmarks && lastId) {
    const updatedLastId = lastId + 1
    const newBookmarkWithId = { ...newBookmark, id: updatedLastId }
    await storeBookmarks([...bookmarks, newBookmarkWithId])
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
