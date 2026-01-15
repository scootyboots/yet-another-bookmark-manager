import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { BookmarkEntryProps } from './BookmarkEntry'
import Prompt from './Prompt'
import { search } from 'fast-fuzzy'

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

  const { matches, hasMatches, fastFuzzy } = useMemo(() => {
    const inputRemovedSpaces = inputText.replace(/\s+/g, '')
    const fuzzyText = search(inputRemovedSpaces, bookmarks, {
      keySelector: (bk) => bk.text,
      returnMatchData: true,
    })
    const fuzzyHref = search(inputRemovedSpaces, bookmarks, {
      keySelector: (bk) => bk.href,
      returnMatchData: true,
    })
    // console.log(fuzzyText, fuzzyHref)
    if (!inputRemovedSpaces) {
      setUrlToOpen('')
      setLastMatches([])
      return { matches: [], hasMatches: false, fastFuzzy: [] }
    }
    const matches = findFuzzyMatches(inputRemovedSpaces, bookmarks)
    // const hasMatches = Array.isArray(matches) && matches.length > 0
    const hasMatches = Array.isArray(fuzzyText) && fuzzyText.length > 0
    const durr = fuzzyText as unknown as typeof matches
    if (hasMatches) setLastMatches(durr)
    setUrlToOpen(matches?.[0]?.href ?? '')
    return { matches, hasMatches, fastFuzzy: fuzzyText ?? [] }
  }, [inputText])

  const shakeX = useMemo(() => {
    if (!hasMatches && lastMatches.length !== 0) return true
    return false
  }, [hasMatches, lastMatches])

  const matchLink = useMemo(() => {
    return matches?.[focusIndex]?.href ?? ''
  }, [matches, focusIndex])

  const matchesToRender = useMemo(
    () => (hasMatches ? fastFuzzy ?? [] : []),
    // () => (hasMatches ? matches : lastMatches),
    [hasMatches, matches, lastMatches, fastFuzzy]
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
      <div style={{ paddingBlockStart: '1rem', position: 'relative' }}>
        {matchesToRender.map((match, index) => {
          const moreThan18 = index + 1 > MAX_DISPLAYED_RESULTS
          function splitAtMatch(toSplit: string) {
            const beforeMatch = match.item.text.slice(match.match.index)
            const start = match.item.text.slice(
              match.match.index,
              match.match.length
            )
            const remaining = match.item.text.slice(
              match.match.index + match.match.length
            )
            const marked = <mark>{start}</mark>
            return (
              <>
                {beforeMatch}
                {marked}
                {remaining}
              </>
            )
            return beforeMatch + <mark>{start}</mark> + remaining
            return `${beforeMatch} | ${start} | ${remaining}`
          }
          const itemSplit = match.item.text
          const hrefSplit = match.item.href
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
              <div className="Search-result-text">
                <HighlightedMatch toMatch={match.item.text} input={inputText} />
              </div>
              <div className="Search-result-divider"> : </div>
              <div className="Search-result-link">{match.item.href}</div>
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
                {fastFuzzy.length > MAX_DISPLAYED_RESULTS
                  ? `${MAX_DISPLAYED_RESULTS} / ${fastFuzzy.length}`
                  : `${fastFuzzy.length}`}
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
  input,
}: {
  toMatch: string
  input: string
}) {
  const toMatchLetters = toMatch.split('')
  // const inputLetters = input.split('')
  // let firstMatchFound = false
  // let firstMatchIndex = 0
  // let lastMatchIndex = 0
  // const consecutiveMatches = []
  // for (let index = 0; index < toMatchLetters.length; index++) {
  //   const matchLetter = toMatchLetters[index].toLowerCase()
  //   let consecutiveMatch = 1
  //   for (let i = 0; i < inputLetters.length; i++) {
  //     const inputLetter = inputLetters[i].toLowerCase()
  //     const nextMatchLetter = inputLetter[i + 1]?.toLowerCase()
  //     const isMatchedLetter = inputLetter === matchLetter
  //     const isNextMatchedLetter = nextMatchLetter === matchLetter
  //     if (isMatchedLetter && !firstMatchFound) {
  //       firstMatchFound = true
  //       firstMatchIndex = index
  //     }
  //     if (isMatchedLetter) {
  //       lastMatchIndex = index
  //       if (isNextMatchedLetter) {
  //         consecutiveMatch++
  //       }
  //     }
  //     consecutiveMatches.push({
  //       car: matchLetter,
  //       index,
  //       length: consecutiveMatch,
  //     })
  //     consecutiveMatch = 0
  //   }
  // }
  const bestMatch = highlightedMatch({ match: toMatch, input })
  console.log(bestMatch)
  const beforeMatch = toMatchLetters.slice(0, bestMatch.labelIndex)
  const matched = toMatchLetters.slice(
    bestMatch.labelIndex,
    bestMatch.labelIndex + bestMatch.length
  )
  const afterMatched = toMatchLetters.slice(
    bestMatch.labelIndex + bestMatch.length
  )
  if (toMatchLetters.includes('Unicode Lookup')) {
    // console.log('consecutive matches', consecutiveMatches)
  }

  return (
    <>
      {beforeMatch}
      <mark>{matched}</mark>
      {afterMatched}
    </>
  )
}

// https://github.com/microsoft/vscode/blob/main/src/vs/base/common/fuzzyScorer.ts

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
  console.log(bestMatches)
  console.log('Longest Match:\n', longestMatch)
  return longestMatch
}
