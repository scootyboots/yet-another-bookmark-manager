import { useAnimate } from 'motion/react'
import { useEffect } from 'react'
import { cn } from '@/lib/utils'

export function Carrot({
  isIdle,
  isVisible,
}: {
  isIdle: boolean
  isVisible: boolean
}) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (isVisible && isIdle) {
      animate(
        scope.current,
        { opacity: [1, 0, 1] },
        {
          duration: 0.95,
          ease: 'linear',
          repeat: Infinity,
        },
      )
    }
  }, [isIdle, isVisible])
  return (
    <div
      ref={scope}
      className={cn('w-2.75 h-1', {
        'bg-primary': isVisible,
      })}
    />
  )
}
