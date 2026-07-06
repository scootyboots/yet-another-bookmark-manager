import { cn } from '@/lib/utils'
import { highlightedRegexMatch } from './util'

export type BookmarkListItemProps = {
  text: string
  href: string
  query?: string
  isFocused?: boolean
}

export function BookmarkListItem(props: BookmarkListItemProps) {
  const { text, href, query = '', isFocused = false } = props
  return (
    <>
      <div className="Search-result-text text-nowrap">
        <HighlightedMatch toMatch={text} query={query} focused={isFocused} />
      </div>
      <div className="Search-result-divider text-primary"> : </div>
      <div
        className={cn(
          'Search-result-link opacity-45 text-ellipsis text-nowrap overflow-hidden',
        )}
      >
        {href}
      </div>
    </>
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
        className={cn('bg-primary text-white transition duration-150', {
          'bg-accent': focused,
          'bg-primary-low': !focused,
        })}
      >
        {matched}
      </mark>
      {afterMatched}
    </>
  )
}
