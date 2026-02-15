import { FocusTrap } from 'focus-trap-react'
import { CSSProperties, PropsWithChildren, useEffect, useRef } from 'react'
import { useTrackFocus } from './useTrackFocus'
import { useClickOutside } from './PopOutMenu'

type PromptProps = PropsWithChildren<{
  isShown: boolean
  className?: string
  setIsShown?: (state: boolean) => void
  promptStyles?: CSSProperties
  contentStyles?: CSSProperties
}>

export default function Prompt({
  isShown,
  className = '',
  setIsShown,
  children,
  promptStyles,
  contentStyles,
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
        <div
          className={className ? 'Prompt ' + className : 'Prompt'}
          data-prompt-open={isShown}
          style={promptStyles}
        >
          <div
            className="Prompt-content"
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
