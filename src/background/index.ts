import bookmarks from '../../public/bookmarks-backup.json'

export type Bookmarks = typeof bookmarks
export type Bookmark = Bookmarks[number]

chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: 'main.html' })
})

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ bookmarks })
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
  await chrome.storage.local.set({ bookmarks })
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

export async function addBookmark(newBookmark: Bookmark) {
  const { data } = await getStoredBookmarks()
  if (data) {
    await storeBookmarks([...data, newBookmark])
    return { data: makeAddRemoveMessage('add', newBookmark), error: null }
  }
  return { data: null, error: 'failed to pull in existing bookmarks' }
}

export async function removeBookmark(existingBookmark: Bookmark) {
  const { group, href } = existingBookmark
  const { data } = await getStoredBookmarks()

  if (data) {
    const hasExisting = Boolean(
      data.find((bk) => bk.group === group && bk.href === href)
    )
    if (hasExisting) {
      const sameGroup = data.filter((bk) => bk.group === group)
      const otherGroups = data.filter((bk) => bk.group !== group)
      const removedLinkFromGroup = sameGroup.filter((bk) => bk.href === href)
      await storeBookmarks([...otherGroups, ...removedLinkFromGroup])
      return {
        data: makeAddRemoveMessage('remove', existingBookmark),
        error: null,
      }
    }
  }

  return {
    data: null,
    error: 'bookmark not found in existing stored bookmarks',
  }
}

export async function updateBookmark(bookmarkToUpdate: Bookmark) {
  const { group, col } = bookmarkToUpdate
  const { data, error } = await getStoredBookmarks()
  if (data) {
    let foundMatch = false
    const updated = data.map((bk) => {
      if (bk.group === group && bk.col === col) {
        foundMatch = true
        return bookmarkToUpdate
      }
      return bk
    })
    if (foundMatch) {
      await storeBookmarks(updated)
      return {
        data: makeAddRemoveMessage('update', bookmarkToUpdate),
        error: null,
      }
    }
    return { data: null, error: 'failed to find matching bookmark to update' }
  }
  return { data: null, error }
}
