import {
  useCallback,
  useState,
  useRef,
  useEffect,
  type PropsWithChildren,
} from 'react'
import DotsHorizontal from '../components/Icons/DotsHorizontal'
import Dot from '../components/Icons/Dot'

const POP_OUT_TRANSITION_MS = 150

const IconToUse = ({
  isVis,
  icon,
}: {
  isVis: boolean
  icon?: React.ReactNode
}) => {
  if (icon) return icon

  return (
    <div style={{ width: '24px', height: '24px', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '2px',
          transform: isVis
            ? 'scale(1.66) translateY(2px)'
            : 'scale(1) translateY(0)',
          // transitionDuration: `${POP_OUT_TRANSITION_MS / 1000}s`,
          transitionDuration: '0.25s',
        }}
      >
        <Dot />
      </div>
      <div
        style={{
          position: 'absolute',
          top: '0',
          left: '2px',
          opacity: isVis ? 0 : 1,
          // transitionDuration: `${POP_OUT_TRANSITION_MS / 1000}s`,
          // transitionDuration: '2s',
          transitionDuration: '0.25s',
        }}
      >
        <DotsHorizontal />
      </div>
    </div>
  )
}

export default function PopOutMenu({
  children,
  icon,
  iconStyles = {
    width: '24px',
  },
  menuStyles,
}: {
  icon?: React.ReactNode
  iconStyles?: React.CSSProperties
  menuStyles?: React.CSSProperties
} & PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(() => {
    if (isOpen) {
      setTimeout(() => {
        setIsOpen(false)
      }, POP_OUT_TRANSITION_MS)
    } else {
      setIsOpen(true)
      setTimeout(() => {
        setIsVisible(true)
      }, 10)
    }
    if (isVisible) {
      setIsVisible(false)
    }
  }, [isOpen, isVisible])

  useEffect(() => {
    function listener(event: Event) {
      console.log('im listening')
      const t = event.target as HTMLDivElement | null
      if (!menuRef.current) {
        return
      }
      if (menuRef?.current?.contains(t)) {
        return
      }
      setIsVisible(false)
      setTimeout(() => {
        setIsOpen(false)
      }, POP_OUT_TRANSITION_MS)
    }
    if (isOpen) {
      document.addEventListener('mousedown', listener)
      document.addEventListener('touchstart', listener)
    } else {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }

    return () => {
      document.removeEventListener('mousedown', listener)
      document.removeEventListener('touchstart', listener)
    }
  }, [menuRef, isOpen, isVisible])

  return (
    <>
      <button className="pop-out-menu-button" onClick={handleClick}>
        <div className="pop-out-menu-button-icon-wrapper" style={iconStyles}>
          <IconToUse isVis={isVisible} icon={icon} />
        </div>
        {isOpen && (
          <div
            className="pop-out-menu-menu"
            style={{
              opacity: isVisible ? '1' : '0',
              transform: isVisible ? 'translateY(1rem)' : 'translateY(0px)',
              ...menuStyles,
              // display: isOpen ? 'block' : 'none',
            }}
            ref={menuRef}
          >
            {children}
          </div>
        )}
      </button>
    </>
  )
}
