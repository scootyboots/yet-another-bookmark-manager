import { Bookmark } from '@/background'
import { createStore } from 'jotai'
import { beforeEach, vi, describe, it } from 'vitest'
import { bookmarksAtom } from '../bookmarks-atom'

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

describe('addBookmarkAtom', () => {
  it('adds bookmark', async () => {
    console.log('RAN TEST')
    const store = createStore()
    store.set(bookmarksAtom, [testBookmark])
  })
})
