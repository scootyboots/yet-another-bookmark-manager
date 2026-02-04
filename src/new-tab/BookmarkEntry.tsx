import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark } from '../background'
import Refresh from '../components/Icons/Refresh'
import CloseCircle from '../components/Icons/CloseCircle'
import { IconButton } from './NewTab'

function useHasFocus<T>(ref: React.RefObject<T | null>) {
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!(el instanceof HTMLElement)) return
    function handleFocus() {
      setIsFocused(true)
    }
    function handleUnfocus() {
      setIsFocused(false)
    }
    el.addEventListener('focus', handleFocus)
    el.addEventListener('blur', handleUnfocus)
    el.addEventListener('mouseenter', handleFocus)
    el.addEventListener('mouseleave', handleUnfocus)
    return () => {
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('blur', handleUnfocus)
      el.removeEventListener('mouseenter', handleFocus)
      el.removeEventListener('mouseleave', handleUnfocus)
    }
  }, [])

  return isFocused
}

export type BookmarkEntryProps = {
  bookmark: Bookmark
  selectBookmark: (bk: Bookmark) => void
  showBookmarkPrompt: (show: boolean) => void
  removeBookmark: (bk: Bookmark) => void
}

export default function BookmarkEntry(props: BookmarkEntryProps) {
  const linkRef = useRef(null)
  const isLinkFocused = useHasFocus(linkRef)
  return (
    <div className="BookmarkEntry">
      <a
        className="bookmark-link"
        href={props.bookmark.href}
        target="_blank"
        rel="noopener noreferrer"
        ref={linkRef}
      >
        {props.bookmark.text}
      </a>
      <div style={{ display: 'none' }}>{props.bookmark.href}</div>
      <BookmarkControls {...props} isLinkFocused={isLinkFocused} />
    </div>
  )
}

type BookmarkControlProps = Pick<
  BookmarkEntryProps,
  'bookmark' | 'selectBookmark' | 'showBookmarkPrompt' | 'removeBookmark'
> & { isLinkFocused: boolean }
function BookmarkControls({
  bookmark,
  selectBookmark,
  showBookmarkPrompt,
  removeBookmark,
  isLinkFocused,
}: BookmarkControlProps) {
  const updateRef = useRef(null)
  const removeRef = useRef(null)
  const isUpdateFocused = useHasFocus(updateRef)
  const isRemoveFocused = useHasFocus(removeRef)
  const isVisible = useMemo(() => {
    const isVisible = isLinkFocused || isUpdateFocused || isRemoveFocused
    return isVisible
  }, [isLinkFocused, isUpdateFocused, isRemoveFocused])
  const displayText = useMemo(() => {
    if (isUpdateFocused) return 'update'
    if (isRemoveFocused) return 'remove'
    return ''
  }, [isUpdateFocused, isRemoveFocused])
  return (
    <div
      className="bookmark-controls"
      style={{
        position: 'absolute',
        right: 0,
        top: 0,
        display: 'flex',
        flexWrap: 'nowrap',
        gap: '0.2rem',
        backgroundColor: 'var(--background-weak)',
        paddingInline: '0.2rem',
        paddingBlock: '0.2rem',
        borderRadius: '0.4rem',
        transitionDuration: '0.02s',
        visibility: isVisible ? 'visible' : 'hidden',
      }}
    >
      <div ref={updateRef}>
        <IconButton
          icon={<Refresh />}
          clickHandler={() => {
            selectBookmark({ ...bookmark })
            showBookmarkPrompt(true)
          }}
        />
      </div>

      <div>{displayText}</div>
      <div ref={removeRef}>
        <IconButton
          clickHandler={() => removeBookmark(bookmark)}
          icon={<CloseCircle />}
        />
      </div>
    </div>
  )
}
