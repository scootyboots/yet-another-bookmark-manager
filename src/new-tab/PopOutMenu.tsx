import {
  useCallback,
  useState,
  useRef,
  useEffect,
  type PropsWithChildren,
  SyntheticEvent,
} from 'react'
import DotsHorizontal from '../components/Icons/DotsHorizontal'
import Dot from '../components/Icons/Dot'
import { useTrackFocus } from './useTrackFocus'

const POP_OUT_TRANSITION_MS = 150
const POP_OUT_MENU_CLASS_NAME = 'pop-out-menu-menu'

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

export function useClickOutside<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
  onClickOutside?: () => void,
  shouldRemoveListener?: boolean,
) {
  const [isClickOutside, setIsClickOutside] = useState(false)
  useEffect(() => {
    function mouseToucheHandler(event: Event) {
      const t = event.target as HTMLElement | null
      if (!ref.current) {
        setIsClickOutside(false)
        return
      }
      const targetIsInsideRefNode = ref?.current?.contains(t)
      if (targetIsInsideRefNode) {
        setIsClickOutside(false)
        return
      }
      setIsClickOutside(true)
      onClickOutside?.()
    }

    document.addEventListener('mousedown', mouseToucheHandler)
    document.addEventListener('touchstart', mouseToucheHandler)
    if (shouldRemoveListener) {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }

    return () => {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }
  }, [])
  return isClickOutside
}

export default function PopOutMenu({
  children,
  focusOnMount,
  icon,
  iconStyles = {
    width: '24px',
  },
  menuStyles,
}: {
  focusOnMount?: boolean
  icon?: React.ReactNode
  iconStyles?: React.CSSProperties
  menuStyles?: React.CSSProperties
} & PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleClick = useCallback(
    (event: SyntheticEvent) => {
      const checkTargetMenu = () => {
        const t = event.target as HTMLElement
        const className = t?.className ?? ''
        return className === POP_OUT_MENU_CLASS_NAME
      }
      const targetIsMenu = checkTargetMenu()
      if (targetIsMenu) return
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
    },
    [isOpen, isVisible],
  )

  const handleExit = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      setIsOpen(false)
    }, POP_OUT_TRANSITION_MS)
  }, [])

  useClickOutside(menuRef, handleExit, true)

  useEffect(() => {
    function keyboardHandler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        handleExit()
        return
      }
      setTimeout(() => {
        const menuEl = menuRef.current
        const focusedEl = menuEl?.querySelector(':focus')
        if (!focusedEl) {
          handleExit()
          return
        }
      }, 10)
    }
    if (isVisible) {
      document.addEventListener('keydown', keyboardHandler)
      setTimeout(() => {
        const menuEl = menuRef.current
        const focusableEl = menuEl?.querySelector<HTMLButtonElement>(
          'button , a,  [tabindex]:not([tabindex="-1"]), input, select, textarea',
        )
        if (focusableEl) {
          focusableEl.focus()
        }
      }, 10)
    }
    if (!isVisible) {
      document.removeEventListener('keydown', keyboardHandler)
    }

    return () => {
      document.removeEventListener('keydown', keyboardHandler)
    }
  }, [isVisible])

  useEffect(() => {
    function mouseToucheHandler(event: Event) {
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
      document.addEventListener('mousedown', mouseToucheHandler)
      document.addEventListener('touchstart', mouseToucheHandler)
    } else {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }

    return () => {
      document.removeEventListener('mousedown', mouseToucheHandler)
      document.removeEventListener('touchstart', mouseToucheHandler)
    }
  }, [menuRef, isOpen, isVisible])

  useEffect(() => {
    if (focusOnMount) {
      menuTriggerRef?.current?.focus()
    }
  }, [])

  return (
    <div style={{ position: 'relative', width: '24px', height: '24px' }}>
      <button
        className="pop-out-menu-button"
        onClick={handleClick}
        ref={menuTriggerRef}
      >
        <div className="pop-out-menu-button-icon-wrapper" style={iconStyles}>
          <IconToUse isVis={isVisible} icon={icon} />
        </div>
      </button>
      {isOpen && (
        <div
          className={POP_OUT_MENU_CLASS_NAME}
          style={{
            opacity: isVisible ? '1' : '0',
            transform: isVisible ? 'translateY(1rem)' : 'translateY(0px)',
            ...menuStyles,
          }}
          ref={menuRef}
        >
          {children}
        </div>
      )}
    </div>
  )
}
