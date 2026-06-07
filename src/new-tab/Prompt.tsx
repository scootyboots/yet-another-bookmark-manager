import { FocusTrap } from 'focus-trap-react'
import {
  CSSProperties,
  PropsWithChildren,
  RefObject,
  useEffect,
  useRef,
} from 'react'
import { useTrackFocus } from './useTrackFocus'
import { useClickOutside } from './PopOutMenu'
import { twMerge } from 'tailwind-merge'
import { cn } from '@/lib/utils'

type PromptProps = PropsWithChildren<{
  isShown: boolean
  className?: string
  setIsShown?: (state: boolean) => void
  promptStyles?: CSSProperties
  contentStyles?: CSSProperties
  ref?: React.RefObject<null | HTMLDivElement>
}>

export default function Prompt({
  isShown,
  className = '',
  setIsShown,
  children,
  promptStyles,
  contentStyles,
  ref,
}: PromptProps) {
  const contentRef = useRef(null)
  const { focusPreviousElement } = useTrackFocus()
  useClickOutside(contentRef, () => {
    setIsShown?.(false)
  })
  useEffect(() => {
    function keydownHandler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsShown?.(false)
      }
    }
    document.addEventListener('keydown', keydownHandler)
    return () => {
      focusPreviousElement()
      document.removeEventListener('keydown', keydownHandler)
    }
  }, [])

  //   position: relative;
  // display: flex;
  // flex-direction: column;
  // width: 55vw;
  // max-width: 615px;
  // max-height: 80vh;
  // overflow: hidden;
  // background-color: var(--background-weak);
  // border-width: 1px;
  // border-style: solid;
  // border-color: var(--primary-weak);
  // padding-inline: 2rem;
  // padding-block: 2rem;
  // border-radius: 0.5rem;
  // box-shadow: var(--box-shadow-primary);
  return (
    <>
      <div
        className={cn(
          'Prompt-background fixed top-0 bottom-0 left-0 right-0 bg-background shadow-background z-30',
        )}
      />
      <FocusTrap>
        <div
          className={cn(
            'Prompt fixed top-8 left-0 right-0 z-40 rounded-[0.75rem] py-4 px-4 flex justify-center',
            className,
          )}
          data-prompt-open={isShown}
          style={promptStyles}
          ref={ref}
        >
          <div
            className={cn(
              'Prompt-content relative flex flex-col w-[55vw] max-w-[615px] max-h-[80vh] overflow-hidden bg-background border border-primary px-8 py-8 rounded-sm shadow-primary',
            )}
            ref={contentRef}
            style={contentStyles}
          >
            {children}
          </div>
        </div>
      </FocusTrap>
    </>
  )
}
