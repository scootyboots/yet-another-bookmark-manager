import { useEffect } from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarksAtom,
  filterDefaultsSetAtom,
  initializeBookmarkAtomsAtom,
} from './bookmark-atoms'

export default function useInitializeBookmarks() {
  const init = useSetAtom(initializeBookmarkAtomsAtom)
  const bookmarks = useAtomValue(bookmarksAtom)
  const setFilterDefaults = useSetAtom(filterDefaultsSetAtom)
  useEffect(() => {
    init()
  }, [])

  useEffect(() => {
    setFilterDefaults()
  }, [bookmarks])
}
