import { Bookmark } from '@/background'
import { search as fuzzySearch, MatchData } from 'fast-fuzzy'
import { useMemo } from 'react'
import { MAX_DISPLAYED_RESULTS } from './Search'

export default function useMatches(
  inputText: string,
  bookmarks: Bookmark[],
  setLastMatches: (value: React.SetStateAction<MatchData<Bookmark>[]>) => void,
) {
  const matched = useMemo(() => {
    const matches = fuzzySearch(inputText, bookmarks, {
      keySelector: (bk) => bk.text,
      returnMatchData: true,
    })
    const groupMatches = fuzzySearch(inputText, bookmarks, {
      keySelector: (bk) => bk.group,
      returnMatchData: true,
    }).map((match) => match.item.group)
    const uniqueGroups = [...new Set([...groupMatches])]

    if (!inputText) {
      setLastMatches([])
      return { matches: [], hasMatches: false }
    }

    const hasMatches = Array.isArray(matches) && matches.length > 0
    if (hasMatches) setLastMatches(matches)
    return { matches, hasMatches, groupMatches: uniqueGroups }
  }, [inputText])

  const matchesToRender = useMemo(
    () => matched.matches.slice(0, MAX_DISPLAYED_RESULTS),
    [matched.matches],
  )
  return { ...matched, matchesToRender }
}
