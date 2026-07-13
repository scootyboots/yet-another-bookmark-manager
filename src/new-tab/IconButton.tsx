import { cn } from '@/lib/utils'
import { ClassValue } from 'clsx'
import { CSSProperties, type PropsWithChildren } from 'react'

export type IconButtonProps = PropsWithChildren<{
  icon: React.ReactNode
  clickHandler: () => void
  style?: CSSProperties
  classes?: ClassValue
}>

export default function IconButton({
  children,
  icon,
  clickHandler,
  style,
  classes,
}: IconButtonProps) {
  return (
    <button
      className={cn(
        'icon-button flex gap-1.5 items-center cursor-pointer focus:outline-solid focus:outline-2 outline-constructive rounded-full',
        classes,
      )}
      onClick={clickHandler}
      style={style}
    >
      {icon}
      {children}
    </button>
  )
}
