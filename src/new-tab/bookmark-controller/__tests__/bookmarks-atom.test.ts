import { createStore } from 'jotai'
import { beforeEach, vi, describe, it, expect } from 'vitest'
import {
  addBookmark,
  Bookmark,
  getStoredBookmarks,
  removeBookmark,
  updateBookmark,
  updateGroupOrder,
} from '@/background'
import {
  bookmarksAtom,
  bookmarkMutationAtoms,
} from '@/new-tab/bookmark-controller/bookmark-atoms'

vi.mock('@/background', () => ({
  getStoredBookmarks: vi.fn(),
  removeBookmark: vi.fn(),
  addBookmark: vi.fn(),
  updateBookmark: vi.fn(),
  resetBookmarks: vi.fn(),
  updateGroupOrder: vi.fn(),
  addGroup: vi.fn(),
  removeGroup: vi.fn(),
  updateGroupName: vi.fn(),
  getStoredRecentLinks: vi.fn(),
  updateRecentLinks: vi.fn(),
}))

beforeEach(() => vi.clearAllMocks())

const testBookmark: Bookmark = {
  id: 1,
  group: 'text',
  groupIndex: 1,
  col: 1,
  href: 'https://example.com',
  text: 'test-test-test',
}
const otherBkText = 'another-test-bookmark'
const otherBookmark = { ...testBookmark, text: otherBkText, id: 2 }

describe('addBookmarkAtom', () => {
  it('adds bookmark', async () => {
    console.log('RAN TEST')
    const store = createStore()
    store.set(bookmarksAtom, [])
    expect(store.get(bookmarksAtom).length).toEqual(0)
    store.set(bookmarksAtom, [testBookmark])
    const updatedBks = store.get(bookmarksAtom)
    expect(updatedBks.length).toEqual(1)
    vi.mocked(addBookmark).mockResolvedValue({ data: 'added', error: null })
    vi.mocked(getStoredBookmarks).mockResolvedValue({
      data: [testBookmark, otherBookmark],
      error: null,
    })
    await store.set(bookmarkMutationAtoms.addBookmarkAtom, otherBookmark)
    const updatedAgain = store.get(bookmarksAtom)
    expect(updatedAgain[1].text).toBe(otherBkText)
  })
})

describe('removeBookmarkAtom', () => {
  it('removes bookmark and refreshes the list', async () => {
    const store = createStore()
    store.set(bookmarksAtom, [testBookmark, otherBookmark])
    vi.mocked(removeBookmark).mockResolvedValue({
      data: 'removed',
      error: null,
    })
    vi.mocked(getStoredBookmarks).mockResolvedValue({
      data: [otherBookmark],
      error: null,
    })
    await store.set(bookmarkMutationAtoms.removeBookmarkAtom, testBookmark)
    expect(removeBookmark).toHaveBeenCalledWith(testBookmark)
    expect(getStoredBookmarks).toHaveBeenCalled()
    const updatedBks = store.get(bookmarksAtom)
    expect(updatedBks.length).toBe(1)
    expect(updatedBks[0].text).toBe(otherBkText)
  })
})

describe('updateBookmarkAtom', () => {
  it('updates existing bookmark with new text', async () => {
    const store = createStore()
    store.set(bookmarksAtom, [testBookmark])
    const updatedText = 'updated'
    const updatedBk = { ...testBookmark, text: updatedText }
    vi.mocked(updateBookmark).mockResolvedValue({
      data: 'updated',
      error: null,
    })
    vi.mocked(getStoredBookmarks).mockResolvedValue({
      data: [updatedBk],
      error: null,
    })
    await store.set(bookmarkMutationAtoms.updateBookmarkAtom, updatedBk)
    const bks = store.get(bookmarksAtom)
    expect(bks[0].text).toBe(updatedText)
  })
})

describe('updateGroupOrderAtom', () => {
  it('should raise group order', async () => {
    const store = createStore()
    store.set(bookmarksAtom, [testBookmark])
    const updatedBk = {
      ...testBookmark,
      groupIndex: testBookmark.groupIndex + 1,
    }
    vi.mocked(updateGroupOrder).mockResolvedValue({
      data: 'updated',
      error: null,
    })
    vi.mocked(getStoredBookmarks).mockResolvedValue({
      data: [updatedBk],
      error: null,
    })
    await store.set(
      bookmarkMutationAtoms.updateGroupOrderAtom,
      updatedBk.group,
      updatedBk.col,
      'raise',
    )
    const updatedBks = store.get(bookmarksAtom)
    expect(updatedBks[0].groupIndex).toBe(updatedBk.groupIndex)
  })
})
