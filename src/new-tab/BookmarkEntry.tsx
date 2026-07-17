import { cn } from '@/lib/utils'
import { useEffect, useRef, useState } from 'react'
import { Bookmark } from '../background'
import { BookmarkPromptType } from './BookmarkPrompt'
import useHasFocusHover from './useHasFocusHover'
import BookmarkControls from './BookmarkControls'

export type BookmarkEntryProps = {
  bookmark: Bookmark
  showBookmarkPrompt: (show: boolean) => void
  removeBookmark: (bk: Bookmark) => void
  setBookmarkPromptType: React.Dispatch<
    React.SetStateAction<BookmarkPromptType>
  >
  index: number
}

export default function BookmarkEntry(props: BookmarkEntryProps) {
  const linkRef = useRef(null)
  const bookmarkRef = useRef(null)
  const [_, setMountControls] = useState(false)
  const isBookmarkEntryFocused = useHasFocusHover(bookmarkRef)
  const [hasMouse, setHasMouse] = useState(false)

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
    >
      <a
        className={cn(
          'bookmark-link text-white text-base no-underline focus:outline-solid focus:outline-2 outline-constructive',
        )}
        href={props.bookmark.href}
        target="_blank"
        rel="noopener noreferrer"
        ref={linkRef}
      >
        {props.bookmark.text}
      </a>
      <div className={cn('hidden')}>{props.bookmark.href}</div>
      {isBookmarkEntryFocused ||
        (hasMouse && (
          <BookmarkControls
            {...props}
            isBookmarkEntryFocused={isBookmarkEntryFocused}
            isBookmarkEntryMoused={hasMouse}
            setMountControls={setMountControls}
          />
        ))}
    </div>
  )
}
