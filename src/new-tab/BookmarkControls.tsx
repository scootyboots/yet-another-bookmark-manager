import { useRef, useMemo, useState, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { cn } from '@/lib/utils'
import { BookmarkEntryProps } from './BookmarkEntry'
import { BookmarkPromptType } from './BookmarkPrompt'
import { selectedBookmarkAtom } from './bookmark-controller/bookmark-atoms'
import IconButton from './IconButton'
import Refresh from '@/components/Icons/Refresh'
import CloseCircle from '@/components/Icons/CloseCircle'
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

export default function BookmarkControls({
  bookmark,
  showBookmarkPrompt,
  removeBookmark,
  isBookmarkEntryFocused,
  isBookmarkEntryMoused,
  setBookmarkPromptType,
  index,
}: BookmarkControlProps) {
  const controlsRef = useRef<HTMLDivElement>(null)
  const setSelectBookmark = useSetAtom(selectedBookmarkAtom)
  const [isControlsExpand, setIsControlsExpand] = useState(false)
  const [controlsText, setControlsText] = useState('update')

  const isControlsVisible = useMemo(
    () => true,
    // () => isBookmarkEntryFocused || isBookmarkEntryMoused,
    [isBookmarkEntryFocused, isBookmarkEntryMoused],
  )

  const bookmarkId = useMemo(
    () => `${bookmark.group}-${bookmark.groupIndex}-${index}`,
    [bookmark, index],
  )

  return (
    <AnimatePresence>
      {isControlsVisible && (
        <motion.div
          onFocus={() => {
            setIsControlsExpand(true)
          }}
          onBlur={() => {
            setIsControlsExpand(false)
          }}
          onMouseEnter={() => setIsControlsExpand(true)}
          onMouseOut={() => {
            setIsControlsExpand(false)
          }}
          onMouseMove={() => setIsControlsExpand(true)}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.065, ease: 'easeOut' }}
          className={cn(
            'bookmark-controls absolute px-7, py-1 -right-2.5 -top-2 cursor-pointer invisible duration-0',
            { visible: isControlsVisible },
          )}
          ref={controlsRef}
          data-bookmark-id={bookmarkId}
          onClick={() => {
            if (controlsText === 'update') {
              setBookmarkPromptType('update-bookmark')
              setSelectBookmark({ ...bookmark })
              showBookmarkPrompt(true)
            }
            if (controlsText === 'remove') {
              removeBookmark(bookmark)
            }
          }}
        >
          <div
            className={cn(
              'overflow-hidden flex border-primary content-center items-center flex-nowrap relative',
              'font-mono p-1 rounded-full',
              'border-primary border',
              'bg-background-high',
              'gap-0.5',
              { 'gap-1.5': isControlsExpand },
            )}
            style={{ transitionDuration: '0.02s' }}
          >
            <div
              data-kill-me="scott"
              className={cn(
                'w-7.5 h-6 background-gradient-side-dark absolute z-20 right-0 bg-linear-to-r from-transparent from-0% to-background to-20%',
              )}
            />
            <div
              onMouseEnter={() => setControlsText('update')}
              onFocus={() => setControlsText('update')}
            >
              <IconButton
                classes={cn('', {
                  'rotate-180': isControlsExpand,
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

            <div
              className={cn('text-over text-clip w-0 relative', {
                'w-10': isControlsExpand,
              })}
              style={{ transitionDuration: '0.095s' }}
            >
              <div
                className={cn('absolute z-10 left-2 -bottom-2.25', {
                  'left-0': isControlsExpand,
                })}
              >
                {controlsText}
              </div>
            </div>

            <div
              className={cn('z-30')}
              onMouseEnter={() => setControlsText('remove')}
              onFocus={() => setControlsText('remove')}
            >
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
