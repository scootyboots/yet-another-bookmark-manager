import { useEffect, useMemo, useRef, useState } from 'react'
import { Bookmark } from '../background'
import { BookmarkPromptType } from './BookmarkPrompt'
import Refresh from '../components/Icons/Refresh'
import CloseCircle from '../components/Icons/CloseCircle'
import IconButton from './IconButton'
import { selectedBookmarkAtom } from './bookmark-controller/bookmark-atoms'
import { useAtom } from 'jotai'
import { cn } from '@/lib/utils'

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
  showBookmarkPrompt: (show: boolean) => void
  removeBookmark: (bk: Bookmark) => void
  setBookmarkPromptType: React.Dispatch<
    React.SetStateAction<BookmarkPromptType>
  >
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
    <div className={cn('BookmarkEntry relative mbe-3')} ref={bookmarkRef}>
      <a
        className={cn(
          'bookmark-link text-white text-base no-underline focus:outline-solid focus:outline-2 outline-primary',
        )}
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
  'bookmark' | 'showBookmarkPrompt' | 'removeBookmark'
> & {
  isLinkFocused: boolean
  setMountControls: React.Dispatch<React.SetStateAction<boolean>>
  setBookmarkPromptType: React.Dispatch<
    React.SetStateAction<BookmarkPromptType>
  >
}
function BookmarkControls({
  bookmark,
  showBookmarkPrompt,
  removeBookmark,
  isLinkFocused,
  setMountControls,
  setBookmarkPromptType,
}: BookmarkControlProps) {
  const updateRef = useRef(null)
  const removeRef = useRef(null)
  const controlsRef = useRef(null)
  const isUpdateFocused = useHasFocus(updateRef)
  const isRemoveFocused = useHasFocus(removeRef)
  const isControlsFocused = useHasFocus(controlsRef)
  // const isControlsFocused = true
  const [_, selectBookmark] = useAtom(selectedBookmarkAtom)

  // const isVisible = useMemo(
  //   () => true,
  //   [isLinkFocused, isUpdateFocused, isRemoveFocused],
  // )

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
      className={cn(
        'bookmark-controls absolute px-7, py-1 -right-2.5 -top-2 cursor-pointer',
        { visible: isVisible, hidden: !isVisible },
      )}
      ref={controlsRef}
      // style={{
      //   position: 'absolute',
      //   paddingInline: '1.8rem',
      //   paddingBlock: '0.2rem',
      //   right: '-1.8rem',
      //   top: '-0.4rem',
      //   visibility: isVisible ? 'visible' : 'hidden',
      //   cursor: 'pointer',
      // }}
      onClick={() => {
        if (displayText === 'update') {
          setBookmarkPromptType('update-bookmark')
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
        className={cn(
          'overflow-hidden flex border-primary content-center items-center flex-nowrap',
          'font-mono p-1 rounded-full duration-200',
          'border-primary border',
          'bg-background-high',
          {
            'gap-1.5': isControlElFocused,
            'gap-0.5': !isControlElFocused,
          },
        )}
        // style={{
        //   overflow: 'hidden',
        //   display: 'flex',
        //   gap: isControlElFocused ? '0.4rem' : '0.1rem',
        //   alignContent: 'center',
        //   alignItems: 'center',
        //   flexWrap: 'nowrap',
        //   fontFamily: 'monospace',
        //   backgroundColor: 'var(--background-weak)',
        //   paddingInline: '0.2rem',
        //   paddingBlock: '0.2rem',
        //   borderRadius: '999rem',
        //   transitionDuration: '0.02s',
        //   borderStyle: 'solid',
        //   borderWidth: '1px',
        //   borderColor: 'var(--primary)',
        // }}
      >
        <div ref={updateRef}>
          <IconButton
            icon={<Refresh />}
            clickHandler={() => {
              selectBookmark({ ...bookmark })
              setBookmarkPromptType('update-bookmark')
              showBookmarkPrompt(true)
            }}
          />
        </div>

        <div
          className={cn('duration-75 text-over text-clip', {
            'w-10': isControlElFocused,
            'w-0': !isControlElFocused,
          })}
          // style={{
          //   transitionDuration: '0.085s',
          //   width: isControlElFocused ? '2.2rem' : '0',
          //   textOverflow: 'clip',
          // }}
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
                primaryFillClasses={cn('fill-destructive')}
                secondaryFillClasses={cn('fill-destructive-foreground')}
                // primaryFill="var(--error-weak)"
                // secondaryFill="var(--error)"
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
