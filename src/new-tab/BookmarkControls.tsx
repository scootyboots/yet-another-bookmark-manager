import { useRef, useMemo, useEffect, useState } from 'react'
import { useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { BookmarkEntryProps } from './BookmarkEntry'
import { BookmarkPromptType } from './BookmarkPrompt'
import { selectedBookmarkAtom } from './bookmark-controller/bookmark-atoms'
import useHasFocusHover from './useHasFocusHover'
import IconButton from './IconButton'
import Refresh from '@/components/Icons/Refresh'
import CloseCircle from '@/components/Icons/CloseCircle'
import { useTrackFocus } from './useTrackFocus'
import { AnimatePresence, motion } from 'motion/react'

type BookmarkControlProps = Pick<
  BookmarkEntryProps,
  'bookmark' | 'showBookmarkPrompt' | 'removeBookmark'
> & {
  isBookmarkEntryFocused: boolean
  isBookmarkEntryMoused: boolean
  setMountControls: React.Dispatch<React.SetStateAction<boolean>>
  setBookmarkPromptType: React.Dispatch<
    React.SetStateAction<BookmarkPromptType>
  >
  index: number
}

// TODO: refactor to use motion

export default function BookmarkControls({
  bookmark,
  showBookmarkPrompt,
  removeBookmark,
  isBookmarkEntryFocused,
  isBookmarkEntryMoused,
  setMountControls,
  setBookmarkPromptType,
  index,
}: BookmarkControlProps) {
  const updateRef = useRef<HTMLDivElement>(null)
  const removeRef = useRef<HTMLDivElement>(null)
  const controlsRef = useRef<HTMLDivElement>(null)
  const gapRef = useRef<HTMLDivElement>(null)
  const isUpdateFocused = useHasFocusHover(updateRef)
  const isRemoveFocused = useHasFocusHover(removeRef)
  const isControlsFocused = useHasFocusHover(controlsRef)
  const isGapFocused = useHasFocusHover(gapRef)
  const setSelectBookmark = useSetAtom(selectedBookmarkAtom)

  const isFocusOrHover = useMemo(
    () => isBookmarkEntryFocused || isBookmarkEntryMoused,
    [isBookmarkEntryFocused, isBookmarkEntryMoused],
  )

  const [hasMouse, setHasMouse] = useState(false)

  useEffect(() => {
    if (isControlsFocused) {
      console.log('CONTROLS REF FOCUS OR MOUSE EVENT')
    }
  }, [controlsRef])

  const bookmarkId = useMemo(
    () => `${bookmark.group}-${bookmark.groupIndex}-${index}`,
    [bookmark, index],
  )

  const { displayText, isControlElFocused } = useMemo(() => {
    let displayText = ''
    let isControlElFocused =
      isUpdateFocused ||
      isRemoveFocused ||
      isControlsFocused ||
      isGapFocused ||
      hasMouse
    if (isUpdateFocused || isControlsFocused || isGapFocused || hasMouse)
      displayText = 'update'
    if (isRemoveFocused) displayText = 'remove'
    // const isVisible = isLinkFocused || isUpdateFocused || isRemoveFocused
    return { displayText, isControlElFocused }
  }, [
    isUpdateFocused,
    isRemoveFocused,
    isControlsFocused,
    isGapFocused,
    hasMouse,
  ])

  return (
    <AnimatePresence>
      {isFocusOrHover && (
        <motion.div
          onMouseEnter={() => setHasMouse(true)}
          onMouseOut={() => setHasMouse(false)}
          onMouseMove={() => setHasMouse(true)}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.065, ease: 'easeOut' }}
          className={cn(
            'bookmark-controls absolute px-7, py-1 -right-2.5 -top-2 cursor-pointer invisible duration-0',
            { visible: isFocusOrHover },
          )}
          ref={controlsRef}
          data-bookmark-id={bookmarkId}
          onClick={() => {
            if (displayText === 'update') {
              setBookmarkPromptType('update-bookmark')
              setSelectBookmark({ ...bookmark })
              showBookmarkPrompt(true)
            }
            if (displayText === 'remove') {
              removeBookmark(bookmark)
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
              { 'gap-1.5': isControlElFocused },
            )}
            style={{ transitionDuration: '0.02s' }}
            ref={gapRef}
          >
            {isFocusOrHover && (
              <div ref={updateRef}>
                <IconButton
                  classes={cn('', {
                    'rotate-180': isControlElFocused,
                  })}
                  icon={<Refresh />}
                  clickHandler={() => {
                    setSelectBookmark({ ...bookmark })
                    setBookmarkPromptType('update-bookmark')
                    showBookmarkPrompt(true)
                  }}
                  style={{ transitionDuration: '0.265s' }}
                />
              </div>
            )}
            {/* <AnimatePresence>
              {isControlElFocused && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '40px' }}
                  transition={{ duration: 0.095, ease: 'linear' }}
                  className={cn('text-over text-clip w-0')}
                >
                  {displayText}
                </motion.div>
              )}
            </AnimatePresence> */}

            <div
              className={cn('text-over text-clip w-0', {
                'w-10': isControlElFocused,
              })}
              style={{ transitionDuration: '0.095s' }}
            >
              {displayText}
            </div>

            <div ref={removeRef}>
              <IconButton
                classes={cn('')}
                clickHandler={() => {
                  removeBookmark(bookmark)
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
        </motion.div>
      )}
    </AnimatePresence>
  )
}
