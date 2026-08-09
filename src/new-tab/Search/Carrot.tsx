import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function Carrot({
  isIdle,
  isVisible,
  textMd,
}: {
  isIdle: boolean
  isVisible: boolean
  textMd?: boolean
}) {
  const [blink, setBlink] = useState(false)
  // TODO: change to browser timeout
  const intervalRef = useRef<null | NodeJS.Timeout>(null)
  useEffect(() => {
    if (isVisible && isIdle) {
      const id = setInterval(() => {
        setBlink((prev) => !prev)
      }, 550)
      intervalRef.current = id
    }
    if (!isIdle) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isIdle, isVisible])
  return (
    <div
      className={cn('w-2.75 h-1', {
        'w-[7.5px]': textMd,
        'bg-primary': isVisible,
        'bg-invisible': blink,
      })}
    />
  )
}
