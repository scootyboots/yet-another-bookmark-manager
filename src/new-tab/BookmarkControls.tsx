import { useRef, useMemo } from 'react'
import { useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { BookmarkEntryProps } from './BookmarkEntry'
import { BookmarkPromptType } from './BookmarkPrompt'
import { selectedBookmarkAtom } from './bookmark-controller/bookmark-atoms'
import useHasFocusHover from './useHasFocusHover'
import IconButton from './IconButton'
import Refresh from '@/components/Icons/Refresh'
import CloseCircle from '@/components/Icons/CloseCircle'

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

// TODO: refactor to use motion

export default function BookmarkControls({
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
  const isUpdateFocused = useHasFocusHover(updateRef)
  const isRemoveFocused = useHasFocusHover(removeRef)
  const isControlsFocused = useHasFocusHover(controlsRef)
  const setSelectBookmark = useSetAtom(selectedBookmarkAtom)

  const { displayText, isControlElFocused } = useMemo(() => {
    let displayText = ''
    let isControlElFocused =
      isUpdateFocused || isRemoveFocused || isControlsFocused
    if (isUpdateFocused || isControlsFocused) displayText = 'update'
    if (isRemoveFocused) displayText = 'remove'
    // const isVisible = isLinkFocused || isUpdateFocused || isRemoveFocused
    return { displayText, isControlElFocused }
  }, [isUpdateFocused, isRemoveFocused, isControlsFocused])

  const isVisible = useMemo(
    () =>
      isLinkFocused || isUpdateFocused || isRemoveFocused || isControlElFocused,
    [isLinkFocused, isUpdateFocused, isRemoveFocused, isControlElFocused],
  )

  // const isVisible = true

  return (
    <div
      className={cn(
        'bookmark-controls absolute px-7, py-1 -right-2.5 -top-2 cursor-pointer invisible duration-0',
        { visible: isVisible },
      )}
      ref={controlsRef}
      onClick={() => {
        if (displayText === 'update') {
          setBookmarkPromptType('update-bookmark')
          setSelectBookmark({ ...bookmark })
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
          'font-mono p-1 rounded-full',
          'border-primary border',
          'bg-background-high',
          'gap-0.5',
          { 'gap-1.5': isControlsFocused },
        )}
        // using the `duration` utility class is making it such that this part of the component
        // doesn't get removed from view instantly - opting for inline style instead
        style={{ transitionDuration: '0.02s' }}
      >
        <div ref={updateRef}>
          <IconButton
            classes={cn({ 'rotate-180': isControlsFocused })}
            icon={<Refresh />}
            clickHandler={() => {
              setSelectBookmark({ ...bookmark })
              setBookmarkPromptType('update-bookmark')
              showBookmarkPrompt(true)
            }}
            style={{ transitionDuration: '0.265s' }}
          />
        </div>

        <div
          className={cn('text-over text-clip w-0', {
            'w-10': isControlsFocused,
          })}
          style={{ transitionDuration: '0.075s' }}
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
                secondaryFillClasses={cn('fill-destructive-weak')}
              />
            }
          />
        </div>
      </div>
    </div>
  )
}
