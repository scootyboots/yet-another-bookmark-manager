import { useState, useEffect } from 'react'

export default function useHasFocusHover<T>(ref: React.RefObject<T | null>) {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const isHtmlEl = el instanceof HTMLElement
    if (!isHtmlEl) return
    function handleFocus() {
      setIsFocused(true)
    }
    function handleUnfocus(event: FocusEvent) {
      const nextTarget = event.relatedTarget as Node
      if (!isHtmlEl) {
        return
      }
      if (nextTarget && el.contains(nextTarget)) {
        return
      }
      setIsFocused(false)
    }
    function handleMouseLeave() {
      // setTimeout(() => {
      //   setIsFocused(false)
      // }, 100)
      setIsFocused(false)
    }
    el.addEventListener('focusin', handleFocus)
    el.addEventListener('focusout', handleUnfocus)
    el.addEventListener('mouseenter', handleFocus)
    el.addEventListener('mouseleave', handleMouseLeave)
    return () => {
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('focusout', handleUnfocus)
      el.removeEventListener('mouseenter', handleFocus)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return isFocused
}
