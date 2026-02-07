import { FocusTrap } from 'focus-trap-react'
import { PropsWithChildren, useEffect } from 'react'
import { useTrackFocus } from './useTrackFocus'

export default function Prompt({
  isShown,
  className,
  children,
}: { isShown: boolean; className?: string } & PropsWithChildren) {
  const { focusPreviousElement } = useTrackFocus()
  useEffect(() => {
    return () => {
      focusPreviousElement()
    }
  }, [])
  return (
    <>
      <div className="Prompt-background" />
      <FocusTrap>
        <div className={'Prompt' + ' ' + className} data-prompt-open={isShown}>
          <div className="Prompt-content">{children}</div>
        </div>
      </FocusTrap>
    </>
  )
}
