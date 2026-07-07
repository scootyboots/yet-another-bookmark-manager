import { useState, useMemo, useRef, PropsWithChildren } from 'react'
import Prompt from '../Prompt'
import { search as fuzzySearch, type MatchData } from 'fast-fuzzy'
import { type Bookmark } from '../../background'
import { cn } from '@/lib/utils'
import { motion, useAnimate } from 'motion/react'
import useMatches from './useMatches'
import useKeyboardControls from './useKeyboardControls'
import useShakeX from './useShakeX'
import useLinkToOpen from './useLinkToOpen'
import { Carrot } from './Carrot'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarksAtom,
  recentLinksAtom,
  selectedBookmarkAtom,
} from '../bookmark-controller/bookmark-atoms'
import { BookmarkListItem } from './BookmarkListItem'
export { LINK_TO_OPEN_SELECTOR, IS_MATCH_SELECTOR } from './useKeyboardControls'

export const SEARCH_INPUT_SELECTOR = '.Search input'
export const MAX_DISPLAYED_RESULTS = 13

type SearchProps = {
  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
  promptUpdateBookmark: (bk: Bookmark) => void
}

export default function Search({
  showSearch,
  setShowSearch,
  promptUpdateBookmark,
}: SearchProps) {
  const bookmarks = useAtomValue(bookmarksAtom)
  const recentLinks = useAtomValue(recentLinksAtom)
  const [inputText, setInputText] = useState('')
  const [urlToOpen, setUrlToOpen] = useState('')
  const [focusIndex, setFocusIndex] = useState(0)
  const [lastMatches, setLastMatches] = useState<Array<MatchData<Bookmark>>>([])
  const [isInputIdle, setIsInputIdle] = useState(true)
  const setSelectedBookmark = useSetAtom(selectedBookmarkAtom)

  const { matches, hasMatches, groupMatches, matchesToRender } = useMatches(
    inputText,
    bookmarks,
    setUrlToOpen,
    setLastMatches,
  )

  const inputRef = useRef<HTMLInputElement>(null)

  useKeyboardControls(
    matches,
    hasMatches,
    focusIndex,
    setFocusIndex,
    promptUpdateBookmark,
    setShowSearch,
    setInputText,
    setUrlToOpen,
    inputRef,
  )

  const linkToOpen = useLinkToOpen(matches, recentLinks, focusIndex)

  const shakeRef = useShakeX(hasMatches, lastMatches)

  useMemo(() => {
    // reset focus back to top on new matches
    setFocusIndex(0)
  }, [matches])

  return showSearch ? (
    <Prompt
      ref={shakeRef}
      isShown={showSearch}
      className="Search"
      setIsShown={setShowSearch}
    >
      <div className="search-input-area flex content-center justify-center">
        <div className={cn('relative p-1.5 mx-16')}>
          <input
            className={cn(
              'border-0 bg-transparent text-white text-lg font-mono focus:outline-none w-full caret-transparent placeholder-neutral-600',
            )}
            placeholder=" type to search..."
            onChange={(e) => {
              setInputText(e.target.value)
              if (e.target.value === '') {
                setIsInputIdle(true)
                return
              }
              if (isInputIdle) {
                setIsInputIdle(false)
              }
              setTimeout(() => {
                setIsInputIdle(true)
              }, 1250)
            }}
            name="bookmark search"
            type="text"
            value={inputText}
            ref={inputRef}
            tabIndex={0}
          />
          <div className={cn('carrot flex flex-nowrap absolute bottom-1.5')}>
            <Carrot isIdle={isInputIdle} isVisible={inputText === ''} />
            {inputText.split('').map((_, i) => {
              const isLast = i + 1 === inputText.length
              const isTooMany = i > 19

              return !isTooMany ? (
                <Carrot isIdle={isInputIdle} isVisible={isLast || isTooMany} />
              ) : null
            })}
            <Carrot isVisible={inputText.length > 20} isIdle={isInputIdle} />
          </div>
        </div>
      </div>

      <div className="search-results text-sm pbs-4 relative">
        {!hasMatches &&
          recentLinks.slice(0, MAX_DISPLAYED_RESULTS).map((link, index) => {
            const isFocused = index === focusIndex
            return (
              <SearchResult
                isFocused={isFocused}
                resultIndex={index}
                href={link.url}
              >
                <BookmarkListItem text={link.text} href={link.url} />
              </SearchResult>
            )
          })}

        {matchesToRender.map((match, index) => {
          const moreThan18 = index + 1 > MAX_DISPLAYED_RESULTS

          if (moreThan18) return null
          const isFocused = index === focusIndex
          if (isFocused) {
            setSelectedBookmark(match.item)
          }
          const { group, href, text } = match.item
          return (
            <SearchResult isFocused={isFocused} resultIndex={index} href={href}>
              <SearchResultGroup isFocused={isFocused}>
                {group}
              </SearchResultGroup>
              <BookmarkListItem
                text={text}
                href={href}
                query={inputText}
                isFocused={isFocused}
              />
              <SearchResultEdit
                isFocused={isFocused}
                onClick={() => {
                  promptUpdateBookmark(match.item)
                  setShowSearch(false)
                }}
              />
            </SearchResult>
          )
        })}
      </div>
      {inputText && <SearchResultsOverview matches={matches} />}
      <SelectedLink
        matchLink={linkToOpen.href}
        matchLinkText={linkToOpen.text}
      />
    </Prompt>
  ) : null
}

function SelectedLink({
  matchLink,
  matchLinkText,
}: {
  matchLink: string
  matchLinkText: string
}) {
  return (
    <div
      data-link-to-open={Boolean(matchLink)}
      style={{ display: 'none' }}
      data-link-text={matchLinkText}
    >
      {matchLink}
    </div>
  )
}

function SearchResultsOverview({
  matches,
}: {
  matches: MatchData<Bookmark>[] | never[]
}) {
  return (
    <div
      // animate={{ rotate: 360 }}
      // whileTap={{ scale: 0.88 }}
      // key={`${matches}`}
      className={cn(
        'matches-number-display absolute bottom-4 w-[calc(100%-4rem)] text-primary font-bold text-sm',
      )}
    >
      <div className="w-full">
        <div className="flex justify-center">
          <div
            className={cn(
              'z-50 bg-background rounded-sm px-2.5 py-1 shadow-glow-primary border border-primary',
            )}
          >
            {matches.length > MAX_DISPLAYED_RESULTS
              ? `${MAX_DISPLAYED_RESULTS} / ${matches.length}`
              : `${matches.length}`}
          </div>
        </div>
      </div>
    </div>
  )
}

type SearchResultProps = {
  isFocused: boolean
  resultIndex: number
  href: string
} & PropsWithChildren

function SearchResult(props: SearchResultProps) {
  const { isFocused, resultIndex, children, href } = props
  // TODO: better handle this
  return (
    <a
      href={href}
      className={cn(
        'search-result-entry relative font-bold flex gap-2 max-w-[95vw] px-2 py-2 border-2 focus:ring-0 focus:outline-none',
        {
          'border-primary-low rounded-xsm': isFocused,
          'border-transparent': !isFocused,
        },
      )}
      data-is-match
      key={'matching-bookmark-' + resultIndex}
    >
      {children}
    </a>
  )
}

function SearchResultGroup({
  isFocused,
  children: groupName,
}: { isFocused: boolean } & PropsWithChildren) {
  return (
    <div
      className={cn(
        'Search-result-group text-sm z-50 absolute right-2 px-2 rounded-tr-xsm rounded-tl-xsm bg-primary-low text-background top-[-1.39rem]',
        {
          'opacity-100': isFocused,
          'opacity-0': !isFocused,
        },
      )}
    >
      {groupName}
    </div>
  )
}

function SearchResultEdit({
  isFocused,
  children: groupName,
  onClick,
}: { isFocused: boolean; onClick: () => void } & PropsWithChildren) {
  return isFocused ? (
    <div
      className={cn(
        'Search-result-edit absolute duration-125 px-2 rounded-br-xsm rounded-bl-xsm z-50 left-[calc(50%-70px)] bg-primary-low text-background cursor-pointer text-sm pb-px',
        {
          'bottom-[-1.35rem] opacity-100': isFocused,
        },
      )}
      onClick={onClick}
    >
      <div>edit: mod + enter</div>
    </div>
  ) : null
}

/**
 * decided to go away from this kind of approach in favor of highlightedRegexMatch
 * should probably just delete this
 */
// function highlightedMatch({ match, input }: { match: string; input: string }) {
//   const bookmarkLabel = match.split('')
//   const searchInput = input.split('')

//   const bestMatches = []
//   const query = searchInput
//   const ignoreCharacters = /[\s;:\.\?\!\,'"\|]/
//   for (let queryIndex = 0; queryIndex < query.length; queryIndex++) {
//     const queryCar = query[queryIndex].toLowerCase()

//     let matchLength = 0
//     let bestLength = 0
//     let bestMatch = {
//       start: queryCar,
//       car: '',
//       labelCar: '',
//       internalLabelIndex: 0,
//       labelIndex: 0,
//       length: 0,
//     }

//     for (let labelIndex = 0; labelIndex < bookmarkLabel.length; labelIndex++) {
//       const labelCar = bookmarkLabel[labelIndex].toLowerCase()
//       // TODO: expand match logic
//       const isCurrentMatch = queryCar === labelCar

//       if (isCurrentMatch) {
//         matchLength = 1

//         for (
//           let nextLabelIndex = 1 + labelIndex;
//           nextLabelIndex < bookmarkLabel.length;
//           nextLabelIndex++
//         ) {
//           let nextQueryIndex = matchLength + queryIndex
//           const nextQueryCar = query[nextQueryIndex]?.toLowerCase()
//           const nextLabelCar = bookmarkLabel[nextLabelIndex]?.toLowerCase()

//           const isContinueCarLabel = ignoreCharacters.test(nextLabelCar)
//           const isContinueCarQuery = ignoreCharacters.test(nextQueryCar)

//           // if (isContinueCarLabel && !isContinueCarQuery) {
//           //   console.log('skipping: ' + nextLabelCar)
//           //   // matchLength++
//           //   continue;
//           // }

//           if (!nextQueryCar) {
//             if (matchLength > bestLength) {
//               bestLength = matchLength
//               bestMatch.car = queryCar
//               bestMatch.labelCar = nextLabelCar
//               bestMatch.internalLabelIndex = nextLabelIndex
//               bestMatch.labelIndex = nextLabelIndex + 1 - bestLength
//               bestMatch.length = bestLength
//             }
//             // matchLength = 0
//             break
//           }
//           // console.log(queryCar, nextQueryCar)

//           const isNextMatch = nextQueryCar === nextLabelCar
//           if (isNextMatch) {
//             matchLength++
//             nextQueryIndex++
//             // console.log(nextQueryCar, nextLabelCar)
//             if (matchLength > bestLength) {
//               bestLength = matchLength
//               bestMatch.car = queryCar
//               bestMatch.labelCar = nextLabelCar
//               bestMatch.internalLabelIndex = nextLabelIndex
//               bestMatch.labelIndex = nextLabelIndex + 1 - bestLength
//               bestMatch.length = bestLength
//             }
//           }
//         }
//       }
//     }
//     if (bestMatch.length) {
//       bestMatches.push(bestMatch)
//     }
//   }

//   const longestMatch = bestMatches.sort((a, b) => b.length - a.length)[0]
//   const longestMatchIndex = longestMatch?.labelIndex ?? 0
//   const longestMatchLength = longestMatch?.length ?? 0
//   const beforeMatch = bookmarkLabel.slice(0, longestMatchIndex)
//   const matched = bookmarkLabel.slice(
//     longestMatchIndex,
//     longestMatchIndex + longestMatchLength,
//   )
//   const afterMatched = bookmarkLabel.slice(
//     longestMatchIndex + longestMatchLength,
//   )
//   return { beforeMatch, matched, afterMatched }
// }
