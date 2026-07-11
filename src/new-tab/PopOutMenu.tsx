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
import { cn } from '@/lib/utils'
import { ClassValue } from 'clsx'

const POP_OUT_TRANSITION_MS = 150
const POP_OUT_MENU_CLASS_NAME = 'pop-out-menu-menu'
const FOCUSABLE_SELECTOR =
  'button , a,  [tabindex]:not([tabindex="-1"]), input, select, textarea'

const IconToUse = ({
  isVis,
  icon,
}: {
  isVis: boolean
  icon?: React.ReactNode
}) => {
  if (icon) return icon

  return (
    <div className={cn('relative w-6 h-6')}>
      <div
        className={cn('absolute top-0 left-0.5 duration-200', {
          'scale-150 translate-y-0.5': isVis,
          'scale-1 translate-y-0': !isVis,
        })}
      >
        <Dot />
      </div>
      <div
        className={cn('absolute top-0 left-0.5 duration-200', {
          'opacity-0': isVis,
          'opacity-100': !isVis,
        })}
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
  iconClasses,
  menuClasses,
}: {
  focusOnMount?: boolean
  icon?: React.ReactNode
  iconClasses?: ClassValue
  menuClasses?: ClassValue
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
        const focusableEl =
          menuEl?.querySelector<HTMLButtonElement>(FOCUSABLE_SELECTOR)
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

  function menuClickHandler(event: React.MouseEvent<HTMLDivElement>) {
    const t = event.target as HTMLElement
    if (t) {
      const isButton = t.localName === 'button'
      const isLink = t.localName === 'a'
      if (isButton || isLink) {
        handleExit()
      }
    }
  }

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
    <div className={cn('pop-out-menu relative w-6 h-6')}>
      <button
        className={cn(
          'pop-out-menu-button absolute duration-150 shadow-primary cursor-pointer',
          'p-1',
          'bottom-0 -left-1.5',
          'rounded-sm',
          { 'border-0 px-0 py-0': icon },
          'focus:outline-solid focus:outline-2 outline-primary',
        )}
        onClick={handleClick}
        ref={menuTriggerRef}
      >
        <div
          className={cn(
            'pop-out-menu-button-icon-wrapper flex items-center content-center w-6',
            iconClasses,
          )}
        >
          <IconToUse isVis={isVisible} icon={icon} />
        </div>
      </button>
      {isOpen && (
        <div
          className={cn(
            POP_OUT_MENU_CLASS_NAME,
            'absolute z-50 duration-150 p-3 rounded-sm bg-background shadow-glow-primary',
            '-bottom-30 left-6',
            {
              'opacity-100 translate-y-4': isVisible,
              'opacity-0 translate-y-0': !isVisible,
            },
            menuClasses,
          )}
          ref={menuRef}
          onClick={menuClickHandler}
        >
          {children}
        </div>
      )}
    </div>
  )
}
