import { Bookmark, RecentLinks } from '@/background'
import { MatchData } from 'fast-fuzzy'
import { useMemo } from 'react'

export default function useLinkToOpen(
  matches: never[] | MatchData<Bookmark>[],
  recentLinks: RecentLinks[],
  focusIndex: number,
) {
  return useMemo(() => {
    const link =
      matches?.[focusIndex]?.item?.href ?? recentLinks?.[focusIndex]?.url
    const text =
      matches?.[focusIndex]?.item?.href ?? recentLinks?.[focusIndex]?.text

    return {
      href: link ?? '',
      text: text ?? '',
    }
  }, [matches, focusIndex, recentLinks])
}
