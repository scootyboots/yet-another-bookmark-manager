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
    <button className="icon-button" onClick={clickHandler}>
      {icon}
      {children}
    </button>
  )
}
