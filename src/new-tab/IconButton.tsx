import { cn } from '@/lib/utils'
import { type PropsWithChildren } from 'react'

export type IconButtonProps = PropsWithChildren<{
  icon: React.ReactNode
  clickHandler: () => void
}>

export default function IconButton({
  children,
  icon,
  clickHandler,
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'icon-button flex gap-1.5 items-center cursor-pointer focus:outline-solid focus:outline-2 outline-primary',
      )}
      onClick={clickHandler}
    >
      {icon}
      {children}
    </button>
  )
}
