import { useState, useEffect } from 'react'

export default function useHasFocusHover<T>(ref: React.RefObject<T | null>) {
  const [isFocused, setIsFocused] = useState(false)

  // useEffect(() => {
  //   function keydownHandler(event: KeyboardEvent) {
  //     const isTab = event.key === 'Tab'
  //     if (isTab) {
  //       const node = ref.current as HTMLElement | null
  //       const hasFocusedElement = node?.querySelector(':focus')
  //       console.log('HAS FOCUSED', hasFocusedElement)
  //       if (hasFocusedElement) {
  //         setIsFocused(true)
  //       } else {
  //         setIsFocused(false)
  //       }
  //     }
  //   }
  //   addEventListener('keydown', keydownHandler)
  //   return () => {
  //     setIsFocused(false)
  //     removeEventListener('keydown', keydownHandler)
  //   }
  // }, [])

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
      // const hasFocusEl = el?.querySelector(':focus')
      // if (hasFocusEl) {
      //   return
      // }
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
