import { useState, type PropsWithChildren } from 'react'
import DotsHorizontal from '../components/Icons/DotsHorizontal'

export default function PopOutMenu({
  children,
  menuWidth,
}: { menuWidth?: string } & PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        className="pop-out-menu-button"
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
      >
        <div className="pop-out-menu-button-icon-wrapper">
          <DotsHorizontal />
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
