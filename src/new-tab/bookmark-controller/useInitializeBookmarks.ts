import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { initializeBookmarkAtomsAtom } from './bookmark-atoms'

export default function useInitializeBookmarks() {
  const init = useSetAtom(initializeBookmarkAtomsAtom)
  useEffect(() => {
    init()
  }, [])
}
