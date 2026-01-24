import { useState, type PropsWithChildren } from 'react'
import DotsHorizontal from '../components/Icons/DotsHorizontal'

export default function PopOutMenu({
  children,
  menuWidth,
  icon,
  iconStyles = {
    width: '24px',
  },
}: {
  menuWidth?: string
  icon?: React.ReactNode
  iconStyles?: React.CSSProperties
} & PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="pop-out-menu-button"
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
      >
        <div className="pop-out-menu-button-icon-wrapper" style={iconStyles}>
          {icon ? icon : <DotsHorizontal />}
        </div>
        {isOpen && (
          <div
            className="pop-out-menu-menu"
            style={{ width: menuWidth ?? 'inherit' }}
          >
            {children}
          </div>
        )}
      </button>
    </>
  )
}
