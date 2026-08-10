import { cn } from '@/lib/utils'
import { useRef, useState } from 'react'
import { Bookmark } from '../../background'
import { BookmarkPromptType } from '../BookmarkPrompt'
import BookmarkControls from './BookmarkControls'

export type BookmarkEntryProps = {
  bookmark: Bookmark
  showBookmarkPrompt: (show: boolean) => void
  removeBookmark: (bk: Bookmark) => void
  index: number
  showCount?: boolean
}

export default function BookmarkEntry(props: BookmarkEntryProps) {
  const linkRef = useRef(null)
  const bookmarkRef = useRef(null)
  const [_, setMountControls] = useState(false)
  const [hasMouse, setHasMouse] = useState(false)
  const [isBookmarkEntryFocused, setIsBookmarkEntryFocused] = useState(false)

  return (
    <div
      className={cn('BookmarkEntry relative mbe-3')}
      ref={bookmarkRef}
      onMouseEnter={() => {
        setHasMouse(true)
      }}
      onMouseMove={() => {
        setHasMouse(true)
      }}
      onMouseLeave={() => setHasMouse(false)}
      onFocus={() => {
        setIsBookmarkEntryFocused(true)
      }}
      onBlur={() => {
        setIsBookmarkEntryFocused(false)
      }}
    >
      <a
        className={cn(
          'bookmark-link text-white text-base no-underline focus:outline-solid focus:outline-2 outline-constructive relative',
        )}
        href={props.bookmark.href}
        target="_blank"
        rel="noopener noreferrer"
        ref={linkRef}
      >
        {props.bookmark.text}
        {props.showCount && (
          <span className={cn('text-primary-low font-bold')}>
            {' : '}
            {props.bookmark.openCount}
          </span>
        )}
      </a>
      <div className={cn('hidden')}>{props.bookmark.href}</div>
      <BookmarkControls
        {...props}
        isBookmarkEntryFocused={isBookmarkEntryFocused}
        isBookmarkEntryMoused={hasMouse}
        setMountControls={setMountControls}
      />
    </div>
  )
}

function CountDisplay({ count }: { count: number }) {
  return (
    <div
      className={cn(
        'absolute -right-8 -top-1 w-5.5 h-5.5 rounded-full font-bold bg-primary-low text-center text-sm',
      )}
    >
      {count}
    </div>
  )
}
