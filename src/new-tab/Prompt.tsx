import { PropsWithChildren } from 'react'

export default function Prompt({
  isShown,
  className,
  children,
}: { isShown: boolean; className?: string } & PropsWithChildren) {
  return (
    <>
      <div className="Prompt-background" />
      <div className={'Prompt' + ' ' + className} data-prompt-open={isShown}>
        <div className="Prompt-content">{children}</div>
      </div>
    </>
  )
}
