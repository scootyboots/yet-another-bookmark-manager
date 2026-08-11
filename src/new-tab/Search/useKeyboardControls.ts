import { useEffect, useMemo, useCallback, captureOwnerStack } from 'react'
import { type Bookmark } from '@/background'
import { type MatchData } from 'fast-fuzzy'
import { useSetAtom } from 'jotai'
import { bookmarkMutationAtoms } from '../bookmark-controller/bookmark-atoms'
import { IS_SEARCH_TEST } from './Search'

export const LINK_TO_OPEN_SELECTOR = '[data-link-to-open]'
export const IS_MATCH_SELECTOR = '[data-is-match]'
export const FOCUSED_MATCH_SELECTOR = '[data-is-match][data-is-focused="true"]'

export default function useKeyboardControls(
  matches: MatchData<Bookmark>[],
  hasMatches: boolean,
  focusIndex: number,
  setFocusIndex: React.Dispatch<React.SetStateAction<number>>,
  promptUpdateBookmark: (bookmark: Bookmark) => void,
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>,
  setInputText: React.Dispatch<React.SetStateAction<string>>,
  inputRef: React.RefObject<HTMLInputElement | null>,
) {
  const updateRecentLinks = useSetAtom(
    bookmarkMutationAtoms.updateRecentLinksAtom,
  )
  const increaseOpenCount = useSetAtom(
    bookmarkMutationAtoms.increaseOpenCountAtom,
  )

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      const { key, shiftKey, metaKey } = event
      function preventDefaultIfOpen() {
        const searchElement =
          document.querySelector<HTMLDivElement>('[data-search-open]')
        if (!searchElement) return
        let isOpen = searchElement.getAttribute('data-search-open')
        isOpen === 'true' && event.preventDefault()
      }

      if (key === 'Enter' && metaKey) {
        const focusedMatch = matches?.[focusIndex]?.item
        if (focusedMatch) {
          promptUpdateBookmark(focusedMatch)
          setShowSearch(false)
        }
        return
      }

      if (key === 'Enter') {
        const focusedMatchEl = document.querySelector<HTMLDivElement>(
          FOCUSED_MATCH_SELECTOR,
        )
        if (focusedMatchEl) {
          const bookmarkData = focusedMatchEl.dataset.bookmark
          if (bookmarkData) {
            const bookmark = JSON.parse(bookmarkData) as Bookmark
            updateRecentLinks(bookmark)
            increaseOpenCount(bookmark)
            if (IS_SEARCH_TEST) {
              return
            }
            const currentTabQuery = chrome.tabs.query({
              active: true,
              lastFocusedWindow: true,
            })
            currentTabQuery.then((tabs) => {
              const activeTabId = tabs?.[0]?.id
              chrome.tabs.create({ url: bookmark.href })
              if (activeTabId) {
                chrome.tabs
                  .remove(activeTabId)
                  .then((resp) => {
                    console.log(resp)
                  })
                  .catch((error) => {
                    console.log('TAB REMOVE ERROR', error)
                  })
              }
            })
          }
        }
        return
      }

      const matchesInDom = document.querySelectorAll(IS_MATCH_SELECTOR)
      const isTab = key === 'Tab'
      if (isTab) {
        const inputSearchElement = document.querySelector<HTMLInputElement>(
          'input[name="bookmark search"]',
        )
        setTimeout(() => {
          inputSearchElement?.focus()
        }, 50)
      }
      const isTabUp = shiftKey && isTab
      const isTabDown = !shiftKey && isTab
      if (key === 'ArrowDown' || isTabDown) {
        preventDefaultIfOpen()
        setFocusIndex((prev) => {
          const next = prev + 1
          return matchesInDom?.[next] ? next : 0
        })
      }
      if (key === 'ArrowUp' || isTabUp) {
        preventDefaultIfOpen()
        setFocusIndex((prev) => {
          const next = prev - 1
          return matchesInDom?.[next] ? next : matchesInDom.length - 1
        })
      }
    },
    [matches, focusIndex, inputRef],
  )

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef?.current?.focus()
      }, 50)
    }
    document.addEventListener('keydown', keydownHandler)
    return () => {
      document.removeEventListener('keydown', keydownHandler)
    }
  }, [keydownHandler])
}
