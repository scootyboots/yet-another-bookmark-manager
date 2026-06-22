import { Bookmark } from '@/background'
import { MatchData } from 'fast-fuzzy'
import { useAnimate } from 'motion/react'
import { useMemo, useEffect } from 'react'

/**
 *
 * @param hasMatches
 * @param lastMatches
 * @returns - ref to be attached to the element you want to shake
 */
export default function useShakeX(
  hasMatches: boolean,
  lastMatches: MatchData<Bookmark>[],
) {
  const [scope, animate] = useAnimate()
  const shakeX = useMemo(() => {
    const shouldShake = !hasMatches && lastMatches.length !== 0
    if (shouldShake) return true
    return false
  }, [hasMatches, lastMatches])

  useEffect(() => {
    if (shakeX) {
      animate(
        scope.current,
        { x: ['0px', '4px', '-4px', '0px'] },
        { duration: 0.1, ease: 'easeInOut' },
      )
    }
  }, [shakeX])
  return scope
}
