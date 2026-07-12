import { useState, useEffect } from 'react'

export default function useHasFocusHover<T>(ref: React.RefObject<T | null>) {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!(el instanceof HTMLElement)) return
    function handleFocus() {
      setIsFocused(true)
    }
    function handleUnfocus() {
      setIsFocused(false)
    }
    el.addEventListener('focusin', handleFocus)
    el.addEventListener('focusout', handleUnfocus)
    el.addEventListener('mouseenter', handleFocus)
    el.addEventListener('mouseleave', handleUnfocus)
    return () => {
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('focusout', handleUnfocus)
      el.removeEventListener('mouseenter', handleFocus)
      el.removeEventListener('mouseleave', handleUnfocus)
    }
  }, [])

  return isFocused
}
