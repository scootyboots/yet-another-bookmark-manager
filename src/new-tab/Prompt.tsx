import { FocusTrap } from 'focus-trap-react'
import {
  CSSProperties,
  PropsWithChildren,
  RefObject,
  useEffect,
  useRef,
} from 'react'
import { useTrackFocus } from './useTrackFocus'
import { cn } from '@/lib/utils'
import { ClassValue } from 'clsx'
import useClickOutside from './hooks/useClickOutside'

type PromptProps = PropsWithChildren<{
  isShown: boolean
  className?: string
  setIsShown?: (state: boolean) => void
  promptStyles?: CSSProperties
  contentClasses?: ClassValue
  unstyled?: boolean
  ref?: React.RefObject<null | HTMLDivElement>
}>

function scrollControl(lock?: 'hidden') {
  document.body.style.overflow = lock ?? ''
}

export default function Prompt({
  isShown,
  className = '',
  setIsShown,
  children,
  promptStyles,
  contentClasses,
  unstyled,
  ref,
}: PromptProps) {
  const contentRef = useRef(null)
  const { focusPreviousElement } = useTrackFocus()
  useClickOutside(contentRef, () => {
    setIsShown?.(false)
  })
  useEffect(() => {
    scrollControl('hidden')
    function keydownHandler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsShown?.(false)
      }
    }
    document.addEventListener('keydown', keydownHandler)
    return () => {
      scrollControl()
      focusPreviousElement()
      document.removeEventListener('keydown', keydownHandler)
    }
  }, [])

  return (
    <>
      <div
        className={cn(
          'Prompt-background fixed top-0 bottom-0 left-0 right-0 bg-background z-40 opacity-95 shadow-glow-primary-inset',
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
              'Prompt-content relative flex flex-col w-[55vw] max-w-[615px] max-h-[80vh] overflow-hidden',
              {
                'border border-primary p-5.75 rounded-lg shadow-glow-primary bg-background':
                  !unstyled,
              },
              contentClasses,
            )}
            ref={contentRef}
          >
            {children}
          </div>
        </div>
      </FocusTrap>
    </>
  )
}
