import { useEffect, useState } from 'react'

export const IGNORE_CLICK_OUTSIDE_ATTRIBUTE = 'data-ignore-click-outside'
const IGNORE_CLICK_OUTSIDE_SELECTOR = `[${IGNORE_CLICK_OUTSIDE_ATTRIBUTE}]`

export default function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClickOutside?: () => void,
  shouldRemoveListener?: boolean,
) {
  const [isClickOutside, setIsClickOutside] = useState(false)
  useEffect(() => {
    function mouseToucheHandler(event: Event) {
      const t = event.target as HTMLElement | null
      if (!ref.current) {
        setIsClickOutside(false)
        return
      }
      if (t?.closest(IGNORE_CLICK_OUTSIDE_SELECTOR)) {
        return
      }
      const targetIsInsideRefNode = ref?.current?.contains(t)
      if (targetIsInsideRefNode) {
        setIsClickOutside(false)
        return
      }
      setIsClickOutside(true)
      onClickOutside?.()
    }

    document.addEventListener('mousedown', mouseToucheHandler)
    document.addEventListener('touchstart', mouseToucheHandler)
    if (shouldRemoveListener) {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }

    return () => {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }
  }, [])
  return isClickOutside
}
