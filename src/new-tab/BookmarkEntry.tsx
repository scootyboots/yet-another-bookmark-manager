import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark } from '../background'
import Refresh from '../components/Icons/Refresh'
import CloseCircle from '../components/Icons/CloseCircle'
import IconButton from './IconButton'

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
    el.addEventListener('focusin', handleFocus)
    el.addEventListener('focusout', handleUnfocus)
    el.addEventListener('mouseenter', handleFocus)
    el.addEventListener('mouseleave', handleUnfocus)
    return () => {
      el.removeEventListener('focus', handleFocus)
      el.removeEventListener('focusout', handleUnfocus)
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
  const bookmarkRef = useRef(null)
  const isLinkFocused = useHasFocus(linkRef)
  const isBookmarkFocused = useHasFocus(bookmarkRef)
  const [mountControls, setMountControls] = useState(true)
  useEffect(() => {
    return () => {
      setMountControls(false)
    }
  }, [])
  return (
    <div className="BookmarkEntry" ref={bookmarkRef}>
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
      {mountControls ? (
        <BookmarkControls
          {...props}
          isLinkFocused={isLinkFocused || isBookmarkFocused}
          setMountControls={setMountControls}
        />
      ) : null}
    </div>
  )
}

type BookmarkControlProps = Pick<
  BookmarkEntryProps,
  'bookmark' | 'selectBookmark' | 'showBookmarkPrompt' | 'removeBookmark'
> & {
  isLinkFocused: boolean
  setMountControls: React.Dispatch<React.SetStateAction<boolean>>
}
function BookmarkControls({
  bookmark,
  selectBookmark,
  showBookmarkPrompt,
  removeBookmark,
  isLinkFocused,
  setMountControls,
}: BookmarkControlProps) {
  const updateRef = useRef(null)
  const removeRef = useRef(null)
  const controlsRef = useRef(null)
  const isUpdateFocused = useHasFocus(updateRef)
  const isRemoveFocused = useHasFocus(removeRef)
  const isControlsFocused = useHasFocus(controlsRef)

  const isVisible = useMemo(
    () => isLinkFocused || isUpdateFocused || isRemoveFocused,
    [isLinkFocused, isUpdateFocused, isRemoveFocused],
  )
  const { displayText, isControlElFocused } = useMemo(() => {
    let displayText = ''
    let isControlElFocused =
      isUpdateFocused || isRemoveFocused || isControlsFocused
    if (isUpdateFocused || isControlsFocused) displayText = 'update'
    if (isRemoveFocused) displayText = 'remove'
    return { displayText, isControlElFocused }
  }, [isUpdateFocused, isRemoveFocused, isControlsFocused])
  return (
    <div
      className="bookmark-controls"
      ref={controlsRef}
      style={{
        position: 'absolute',
        paddingInline: '1.8rem',
        paddingBlock: '0.2rem',
        right: '-1.8rem',
        top: '-0.4rem',
        visibility: isVisible ? 'visible' : 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => {
        if (displayText === 'update') {
          selectBookmark({ ...bookmark })
          showBookmarkPrompt(true)
        }
        if (displayText === 'remove') {
          removeBookmark(bookmark)
          // controls not getting remounted
          setMountControls(false)
        }
      }}
    >
      <div
        style={{
          overflow: 'hidden',
          display: 'flex',
          gap: isControlElFocused ? '0.4rem' : '0.1rem',
          alignContent: 'center',
          alignItems: 'center',
          flexWrap: 'nowrap',
          fontFamily: 'monospace',
          backgroundColor: 'var(--background-weak)',
          paddingInline: '0.2rem',
          paddingBlock: '0.2rem',
          borderRadius: '999rem',
          transitionDuration: '0.02s',
          borderStyle: 'solid',
          borderWidth: '1px',
          borderColor: 'var(--primary)',
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

        <div
          style={{
            transitionDuration: '0.085s',
            width: isControlElFocused ? '2.2rem' : '0',
            textOverflow: 'clip',
          }}
        >
          {displayText}
        </div>
        <div ref={removeRef}>
          <IconButton
            clickHandler={() => {
              removeBookmark(bookmark)
              // controls not getting remounted
              setMountControls(false)
            }}
            icon={
              <CloseCircle
                primaryFill="var(--error-weak)"
                secondaryFill="var(--error)"
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
