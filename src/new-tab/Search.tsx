import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BookmarkEntryProps } from './BookmarkEntry'
import Prompt from './Prompt'

export const LINK_TO_OPEN_SELECTOR = '[data-link-to-open]'
export const IS_MATCH_SELECTOR = '[data-is-match]'
export const SEARCH_INPUT_SELECTOR = '.Search input'
export const MAX_DISPLAYED_RESULTS = 16

type SearchProps = {
  bookmarks: Array<BookmarkEntryProps>
  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
}

export default function Search({
  bookmarks,
  showSearch,
  setShowSearch,
}: SearchProps) {
  const [inputText, setInputText] = useState('')
  const [urlToOpen, setUrlToOpen] = useState('')
  const [focusIndex, setFocusIndex] = useState(0)
  const [lastMatches, setLastMatches] = useState<Array<BookmarkEntryProps>>([])

  const { matches, hasMatches } = useMemo(() => {
    const inputRemovedSpaces = inputText.replace(/\s+/g, '')
    if (!inputRemovedSpaces) {
      setUrlToOpen('')
      setLastMatches([])
      return { matches: [], hasMatches: false }
    }
    const matches = findFuzzyMatches(inputRemovedSpaces, bookmarks)
    const hasMatches = Array.isArray(matches) && matches.length > 0
    if (hasMatches) setLastMatches(matches)
    setUrlToOpen(matches?.[0]?.href ?? '')
    return { matches, hasMatches }
  }, [inputText])

  const shakeX = useMemo(() => {
    if (!hasMatches && lastMatches.length !== 0) return true
    return false
  }, [hasMatches, lastMatches])

  const matchLink = useMemo(() => {
    return matches?.[focusIndex]?.href ?? ''
  }, [matches, focusIndex])

  const matchesToRender = useMemo(
    () => (hasMatches ? matches : lastMatches),
    [hasMatches, matches, lastMatches]
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      const { key, metaKey } = event
      console.log(key, event)
      function preventDefaultIfOpen() {
        const searchElement =
          document.querySelector<HTMLDivElement>('[data-search-open]')
        if (!searchElement) return
        let isOpen = searchElement.getAttribute('data-search-open')
        isOpen === 'true' && event.preventDefault()
      }
      if (key === 'Escape') {
        setInputText('')
        setUrlToOpen('')
        setFocusIndex(0)
        setShowSearch(false)
        return
      }
      if (key === 'k' && metaKey) {
        setShowSearch((prev) => {
          const input = document.querySelector<HTMLInputElement>(
            SEARCH_INPUT_SELECTOR
          )
          input?.focus()
          return true
        })
      }
      if (key === 'Enter') {
        const link = document.querySelector(LINK_TO_OPEN_SELECTOR)?.textContent
        if (link) {
          chrome.tabs.create({ url: link })
          setInputText('')
          setUrlToOpen('')
          setFocusIndex(0)
        }
        return
      }
      const matchesInDom = document.querySelectorAll(IS_MATCH_SELECTOR)
      if (key === 'ArrowDown') {
        preventDefaultIfOpen()
        setFocusIndex((prev) => {
          const next = prev + 1
          return matchesInDom?.[next] ? next : 0
        })
      }
      if (key === 'ArrowUp') {
        preventDefaultIfOpen()
        setFocusIndex((prev) => {
          const next = prev - 1
          return matchesInDom?.[next] ? next : matchesInDom.length - 1
        })
      }
      // if (key === 'Tab') {
      //   setFocusIndex((prev) => prev + 1)
      // }
    },
    [urlToOpen]
  )

  useMemo(() => {
    setFocusIndex(0)
  }, [matches])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
    document.addEventListener('keydown', keydownHandler)
    return () => {
      document.removeEventListener('keydown', keydownHandler)
    }
  }, [keydownHandler])

  if (!showSearch) {
    return null
  }

  return (
    <Prompt isShown={showSearch} className={`${shakeX ? ' shakeX' : ''}`}>
      <div data-link-to-open={Boolean(matchLink)} style={{ display: 'none' }}>
        {matchLink}
      </div>

      <input
        onChange={(e) => setInputText(e.target.value)}
        type="text"
        value={inputText}
        ref={inputRef}
        tabIndex={0}
      />
      <div style={{ paddingBlockStart: '1rem' }}>
        {matchesToRender.map((match, index) => {
          const moreThan18 = index + 1 > MAX_DISPLAYED_RESULTS
          if (moreThan18) return null
          return (
            <div
              className="Search-result"
              style={{
                borderColor:
                  index === focusIndex
                    ? 'rgb(230, 60, 159)'
                    : 'rgb(255 0 0 / 0%)',
              }}
              data-is-match
              key={'matching-bookmark-' + index}
            >
              <div className="Search-result-text">{match.text}</div>
              <div className="Search-result-divider"> : </div>
              <div className="Search-result-link">{match.href}</div>
            </div>
          )
        })}
        {inputText && (
          <div className="matches-number-display">
            {matches.length > MAX_DISPLAYED_RESULTS
              ? `${MAX_DISPLAYED_RESULTS} / ${matches.length}`
              : `${matches.length}`}
          </div>
        )}
      </div>
    </Prompt>
  )
}

function findFuzzyMatches(input: string, bookmarks: SearchProps['bookmarks']) {
  // const groupFlagPattern = /^g:\s*(\S+)\s*(.*)/gi
  // const [_, group, inputAfterFlag] = input.match(groupFlagPattern) ?? []
  // console.log('group', group, 'after group', inputAfterFlag)
  // const matchRegexFromFlag = new RegExp(inputAfterFlag ?? '', 'ig')
  // if (group) {
  //   const groupRegex = new RegExp(group ?? '', 'ig')
  //   const inGroup = bookmarks.filter((book) => groupRegex.test(book.group))
  //   for (let index = 0; index < inGroup.length; index++) {
  //     const bookmark = inGroup[index]
  //     const toTest = bookmark.text.replace(/\s+/g, '')
  //     const hasTextMatch = matchRegexFromFlag.test(toTest)
  //     if (hasTextMatch) {
  //       matches.push(bookmark)
  //       continue
  //     }

  //     const hasHrefMatch = matchRegexFromFlag.test(bookmark.href)
  //     if (hasHrefMatch) {
  //       matches.push(bookmark)
  //     }
  //   }
  //   return matches
  // }

  let matches = []
  let hrefMatches = []

  try {
    const matchRegex = new RegExp(input, 'ig')

    for (let index = 0; index < bookmarks.length; index++) {
      const bookmark = bookmarks[index]
      const toTest = bookmark.text.replace(/\s+/g, '')
      const hasTextMatch = matchRegex.test(toTest)
      if (hasTextMatch) {
        matches.push(bookmark)
        continue
      }

      const hasHrefMatch = matchRegex.test(bookmark.href)
      if (hasHrefMatch) {
        hrefMatches.push(bookmark)
      }
    }
    return [...matches, ...hrefMatches]
  } catch {
    return []
  }
}
