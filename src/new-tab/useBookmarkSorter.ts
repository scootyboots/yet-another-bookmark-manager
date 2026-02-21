import { useCallback, useMemo } from 'react'
import { Bookmarks } from '../background'

export default function useBookmarkSorter(bookmarks: Bookmarks) {
  const sorted = useMemo(() => {
    const columns = [...new Set(bookmarks.map((bk) => bk.col))].sort(
      (a, b) => a - b,
    )
    const groupNames = [...new Set(bookmarks.map((bk) => bk.group))]
    const sortedColumns = columns.map((col) =>
      bookmarks
        .filter((bk) => bk.col === col)
        .sort((a, b) => b.groupIndex - a.groupIndex),
    )
    console.log(sortedColumns)
    return { sortedColumns, columns, groupNames }
  }, [bookmarks])

  const findGroupColumNumber = useCallback(
    (groupName: string) => {
      const found = bookmarks.find((bk) => bk.group === groupName)
      return found?.col ?? 1
    },
    [bookmarks],
  )

  const getGroupIndex = useCallback(
    (col: number) => {
      const inCol = sorted.sortedColumns[col - 1]
      const groupIndex = inCol?.[0]?.groupIndex ?? -1 // so that if not found will start at 0
      const current = groupIndex
      const next = groupIndex + 1
      return { current, next }
    },
    [sorted],
  )

  return { ...sorted, findGroupColumNumber, getGroupIndex }
}
