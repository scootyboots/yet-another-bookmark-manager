import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BookmarkEntryProps } from './BookmarkEntry'
import Prompt from './Prompt'
import { search, type MatchData } from 'fast-fuzzy'

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
  const [lastMatches, setLastMatches] = useState<
    Array<MatchData<BookmarkEntryProps>>
  >([])

  const { matches, hasMatches, groupMatches } = useMemo(() => {
    // const inputRemovedSpaces = inputText.replace(/\s+/g, '')
    const matches = search(inputText, bookmarks, {
      keySelector: (bk) => bk.text,
      returnMatchData: true,
    })
    const groupMatches = search(inputText, bookmarks, {
      keySelector: (bk) => bk.group,
      returnMatchData: true,
    }).map((match) => match.item.group)
    const uniqueGroups = [...new Set([...groupMatches])]
    // const fuzzyHref = search(inputRemovedSpaces, bookmarks, {
    //   keySelector: (bk) => bk.href,
    //   returnMatchData: true,
    // })

    if (!inputText) {
      setUrlToOpen('')
      setLastMatches([])
      return { matches: [], hasMatches: false }
    }

    const hasMatches = Array.isArray(matches) && matches.length > 0
    if (hasMatches) setLastMatches(matches)
    setUrlToOpen(matches?.[0]?.item.href ?? '')
    return { matches, hasMatches, groupMatches: uniqueGroups }
  }, [inputText])

  const shakeX = useMemo(() => {
    if (!hasMatches && lastMatches.length !== 0) return true
    return false
  }, [hasMatches, lastMatches])

  const matchLink = useMemo(() => {
    return matches?.[focusIndex]?.item.href ?? ''
  }, [matches, focusIndex])

  const matchesToRender = useMemo(
    () => (hasMatches ? matches : []),
    // () => (hasMatches ? matches : lastMatches),
    [hasMatches, matches, lastMatches]
  )

  const inputRef = useRef<HTMLInputElement>(null)

  const keydownHandler = useCallback(
    (event: KeyboardEvent) => {
      const { key, metaKey } = event
      // console.log(key, event)
      function preventDefaultIfOpen() {
        const searchElement =
          document.querySelector<HTMLDivElement>('[data-search-open]')
        if (!searchElement) return
        let isOpen = searchElement.getAttribute('data-search-open')
        isOpen === 'true' && event.preventDefault()
      }
      if (key === 'Escape') {
        setShowSearch(false)
        return
      }

      if (key === 'Enter') {
        const link = document.querySelector(LINK_TO_OPEN_SELECTOR)?.textContent
        if (link) {
          // TODO: store recently opened / most opened
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
        name="bookmark search"
        type="text"
        value={inputText}
        ref={inputRef}
        tabIndex={0}
      />
      <div style={{ paddingBlockStart: '1rem', position: 'relative' }}>
        {/* 

        TODO: decide what to do with categories

        <div>
          {groupMatches?.map((g) => (
            <p>{g}</p>
          ))}
        </div> */}
        {matchesToRender.map((match, index) => {
          const moreThan18 = index + 1 > MAX_DISPLAYED_RESULTS

          if (moreThan18) return null
          const isFocused = index === focusIndex
          return (
            <div
              className="Search-result"
              style={{
                borderColor:
                  index === focusIndex
                    ? 'rgb(230, 60, 159)'
                    : 'rgb(255 0 0 / 0%)',
                position: 'relative',
              }}
              data-is-match
              key={'matching-bookmark-' + index}
            >
              <div
                className="Search-result-group"
                style={{
                  position: 'absolute',
                  transitionDuration: '0.125s',
                  paddingInline: '0.5rem',
                  borderTopRightRadius: '0.2rem',
                  borderTopLeftRadius: '0.2rem',
                  zIndex: '100',
                  top: isFocused ? '-1.433rem' : '0rem',
                  // left: '0.5rem',
                  right: '0.5rem',
                  // right: isFocused ? '0.5rem' : '-1.5rem',
                  backgroundColor: 'var(--primary)',
                  color: 'var(--background)',
                  opacity: isFocused ? '1' : '0',
                }}
              >
                {match.item.group}
              </div>

              <div className="Search-result-text">
                <HighlightedMatch
                  toMatch={match?.item.text}
                  query={inputText}
                  focused={isFocused}
                />
                {/* <HighlightedRegexMatch
                  toMatch={match.item.text}
                  query={inputText}
                /> */}
              </div>
              <div className="Search-result-divider"> : </div>
              <div className="Search-result-link" style={{ opacity: '0.45' }}>
                {match?.item.href}
              </div>
            </div>
          )
        })}
        {inputText && (
          <div
            className="matches-number-display"
            style={{ position: 'sticky', bottom: 0 }}
          >
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div
                style={{
                  background: 'var(--background)',
                  borderRadius: '0.5rem',
                  paddingInline: '0.6rem',
                  paddingBlock: '0.2rem',
                  boxShadow: 'var(--box-shadow-primary)',
                  // borderStyle: 'solid',
                  // borderWidth: '1px',
                  // borderColor: 'var(--primary-weak)',
                }}
              >
                {matches.length > MAX_DISPLAYED_RESULTS
                  ? `${MAX_DISPLAYED_RESULTS} / ${matches.length}`
                  : `${matches.length}`}
              </div>
            </div>
          </div>
        )}
      </div>
    </Prompt>
  )
}

function HighlightedMatch({
  toMatch,
  query,
  focused,
}: {
  toMatch: string
  query: string
  focused: boolean
}) {
  const { beforeMatch, matched, afterMatched } = highlightedRegexMatch({
    toMatch,
    query,
  })
  return (
    <>
      {beforeMatch}
      <mark
        style={{
          transitionDuration: '0.1s',
          backgroundColor: focused
            ? 'var(--primary)'
            : 'var(--background-accent)',
        }}
      >
        {matched}
      </mark>
      {afterMatched}
    </>
  )
}

function highlightedRegexMatch({
  toMatch,
  query,
}: {
  toMatch: string
  query: string
}) {
  function splitQueryToRegexChunks(query: string) {
    // TODO: replace with RegExp.escape() https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape
    // ... or pull in package
    const replacedQuery = query.replace(
      /([\^\$\.\*\+\?\\(\\)\[\]\{\}\|])/g,
      '\\$1'
    )
    const chunks: RegExp[] = []
    const queryChars = replacedQuery.split('')
    const regexString = '[\\s:\\[\\];:"\'-=+_]*'
    let store = ''
    let storeWithRegex = ''
    let lap = 0
    for (let j = 0; j < queryChars.length; j++) {
      for (let i = 0 + lap; i < queryChars.length; i++) {
        const char = queryChars[i]
        let charWithRegex = char + regexString
        if (char === ' ') {
          charWithRegex = ''
        }
        const isFirst = i - lap === 0
        const isLast = i === queryChars.length - 1
        if (isLast) {
          charWithRegex = char
        }
        if (isFirst) {
          store = ''
          storeWithRegex = ''
        }
        if (isLast) {
          lap++
        }
        store = store + char
        storeWithRegex = storeWithRegex + charWithRegex
        try {
          // chunks.push({
          //   original: store,
          //   regex: new RegExp(storeWithRegex, 'i'),
          // })
          chunks.push(new RegExp(storeWithRegex, 'i'))
        } catch {
          console.log('failed to parse to regex: \n\n', storeWithRegex)
        }
      }
    }
    return [...new Set([...chunks])]
  }
  const emptyMatch = { beforeMatch: 0, matched: 0, afterMatched: 0 }
  const regexChunks = splitQueryToRegexChunks(query)
  const matchingRegex = regexChunks.filter((reg) => reg.test(toMatch))
  const [longestMatch] = matchingRegex.sort(
    (a, b) => `${b}`.length - `${a}`.length
  )
  const matchGroup = toMatch.match(longestMatch)
  if (!matchGroup) return emptyMatch

  const [matchedText] = matchGroup
  const matchIndex = matchGroup.index ?? 0
  const splitMatch = toMatch.split('')
  const start = splitMatch.slice(0, matchIndex)
  const matched = splitMatch.slice(matchIndex, matchIndex + matchedText.length)
  const remaining = splitMatch.slice(matchIndex + matchedText.length)
  return { beforeMatch: start, matched, afterMatched: remaining }
}

function highlightedMatch({ match, input }: { match: string; input: string }) {
  const bookmarkLabel = match.split('')
  const searchInput = input.split('')

  const bestMatches = []
  const query = searchInput
  const ignoreCharacters = /[\s;:\.\?\!\,'"\|]/
  for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
    const queryCar = query[queryIndex].toLowerCase()

    let matchLength = 0
    let bestLength = 0
    let bestMatch = {
      start: queryCar,
      car: '',
      labelCar: '',
      internalLabelIndex: 0,
      labelIndex: 0,
      length: 0,
    }

    for (let labelIndex = 0; labelIndex < bookmarkLabel.length; labelIndex++) {
      const labelCar = bookmarkLabel[labelIndex].toLowerCase()
      // TODO: expand match logic
      const isCurrentMatch = queryCar === labelCar

      if (isCurrentMatch) {
        matchLength = 1

        for (
          let nextLabelIndex = 1 + labelIndex;
          nextLabelIndex < bookmarkLabel.length;
          nextLabelIndex++
        ) {
          let nextQueryIndex = matchLength + queryIndex
          const nextQueryCar = query[nextQueryIndex]?.toLowerCase()
          const nextLabelCar = bookmarkLabel[nextLabelIndex]?.toLowerCase()

          const isContinueCarLabel = ignoreCharacters.test(nextLabelCar)
          const isContinueCarQuery = ignoreCharacters.test(nextQueryCar)

          // if (isContinueCarLabel && !isContinueCarQuery) {
          //   console.log('skipping: ' + nextLabelCar)
          //   // matchLength++
          //   continue;
          // }

          if (!nextQueryCar) {
            if (matchLength > bestLength) {
              bestLength = matchLength
              bestMatch.car = queryCar
              bestMatch.labelCar = nextLabelCar
              bestMatch.internalLabelIndex = nextLabelIndex
              bestMatch.labelIndex = nextLabelIndex + 1 - bestLength
              bestMatch.length = bestLength
            }
            // matchLength = 0
            break
          }
          // console.log(queryCar, nextQueryCar)

          const isNextMatch = nextQueryCar === nextLabelCar
          if (isNextMatch) {
            matchLength++
            nextQueryIndex++
            // console.log(nextQueryCar, nextLabelCar)
            if (matchLength > bestLength) {
              bestLength = matchLength
              bestMatch.car = queryCar
              bestMatch.labelCar = nextLabelCar
              bestMatch.internalLabelIndex = nextLabelIndex
              bestMatch.labelIndex = nextLabelIndex + 1 - bestLength
              bestMatch.length = bestLength
            }
          }
        }
      }
    }
    if (bestMatch.length) {
      bestMatches.push(bestMatch)
    }
  }

  const longestMatch = bestMatches.sort((a, b) => b.length - a.length)[0]
  const longestMatchIndex = longestMatch?.labelIndex ?? 0
  const longestMatchLength = longestMatch?.length ?? 0
  const beforeMatch = bookmarkLabel.slice(0, longestMatchIndex)
  const matched = bookmarkLabel.slice(
    longestMatchIndex,
    longestMatchIndex + longestMatchLength
  )
  const afterMatched = bookmarkLabel.slice(
    longestMatchIndex + longestMatchLength
  )
  return { beforeMatch, matched, afterMatched }
}
