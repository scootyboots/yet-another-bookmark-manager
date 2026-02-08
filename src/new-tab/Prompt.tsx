import { FocusTrap } from 'focus-trap-react'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { useTrackFocus } from './useTrackFocus'
import { useClickOutside } from './PopOutMenu'

type PromptProps = PropsWithChildren<{
  isShown: boolean
  className?: string
  setIsShown?: (state: boolean) => void
}>

export default function Prompt({
  isShown,
  className,
  setIsShown,
  children,
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
  return (
    <>
      <div className="Prompt-background" />
      <FocusTrap>
        <div className={'Prompt' + ' ' + className} data-prompt-open={isShown}>
          <div className="Prompt-content" ref={contentRef}>
            {children}
          </div>
        </div>
      </FocusTrap>
    </>
  )
}
