import { useState, useMemo, useRef, PropsWithChildren } from 'react'
import Prompt from '../Prompt'
import { search as fuzzySearch, type MatchData } from 'fast-fuzzy'
import { type Bookmark } from '../../background'
import { cn } from '@/lib/utils'
import useMatches from './useMatches'
import useKeyboardControls from './useKeyboardControls'
import useShakeX from './useShakeX'
import useLinkToOpen from './useLinkToOpen'
import { useAtomValue, useSetAtom } from 'jotai'
import {
  bookmarkMutationAtoms,
  bookmarksAtom,
  recentLinksAtom,
  selectedBookmarkAtom,
} from '../bookmark-controller/bookmark-atoms'
import { BookmarkListItem } from './BookmarkListItem'
import { SearchInput } from './SearchInput'
export { LINK_TO_OPEN_SELECTOR, IS_MATCH_SELECTOR } from './useKeyboardControls'

export const SEARCH_INPUT_SELECTOR = '.Search input'
export const MAX_DISPLAYED_RESULTS = 13

type SearchProps = {
  showSearch: boolean
  setShowSearch: React.Dispatch<React.SetStateAction<boolean>>
  promptUpdateBookmark: (bookmark: Bookmark) => void
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
        <SearchInput
          inputText={inputText}
          setInputText={setInputText}
          ref={inputRef}
        />
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
                text={link.text}
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
            <SearchResult
              isFocused={isFocused}
              resultIndex={index}
              href={href}
              text={text}
            >
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
      className={cn('hidden')}
      data-link-to-open={Boolean(matchLink)}
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
  text: string
} & PropsWithChildren

function SearchResult(props: SearchResultProps) {
  const { isFocused, resultIndex, children, href, text } = props
  const updateRecentLinks = useSetAtom(
    bookmarkMutationAtoms.updateRecentLinksAtom,
  )
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
      key={'matching-bookmark-' + resultIndex}
      onClick={(e) => {
        e.preventDefault()
        updateRecentLinks(href, text, false)
        window.location.href = href
      }}
      data-is-match
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
