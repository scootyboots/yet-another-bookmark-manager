import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
} from 'react'

const MAIN_CONTENT_CLASS = 'bookmark-groups'
export const BOOKMARK_LINK_CLASS = 'bookmark-link'

type FocusContext = {
  currentFocus: React.RefObject<HTMLAnchorElement | null>
  previousFocus: React.RefObject<HTMLAnchorElement | null>
  focusPreviousElement: () => void
}

const FocusContext = createContext<FocusContext>({
  currentFocus: { current: null },
  previousFocus: { current: null },
  focusPreviousElement: () => {},
})

export function useTrackFocus() {
  const context = useContext(FocusContext)
  if (context === undefined) {
    throw new Error('useTrackFocus used without context provider')
  }
  return context
}

export function TrackFocusProvider({ children }: PropsWithChildren) {
  const currentFocus = useRef<HTMLAnchorElement>(null)
  const previousFocus = useRef<HTMLAnchorElement>(null)

  function checkBookmarkLink(el: HTMLElement | null) {
    if (!el) return null
    if (el.className === BOOKMARK_LINK_CLASS) {
      return true
    }
  }

  useEffect(() => {
    document
      .querySelector('.' + MAIN_CONTENT_CLASS)
      ?.addEventListener('focusin', (event) => {
        const focusedEl = event?.target as HTMLAnchorElement
        if (currentFocus.current) {
          previousFocus.current = currentFocus.current
        }
        const isBookmarkLink = checkBookmarkLink(focusedEl)
        if (isBookmarkLink) {
          currentFocus.current = focusedEl
        }
      })
  }, [])
  const focusPreviousElement = useCallback(() => {
    // @ts-ignore
    previousFocus.current?.focus({ focusVisible: true })
    // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#focusvisible
  }, [currentFocus, previousFocus])

  const focusContext = { currentFocus, previousFocus, focusPreviousElement }

  return (
    <FocusContext.Provider value={focusContext}>
      {children}
    </FocusContext.Provider>
  )
}
