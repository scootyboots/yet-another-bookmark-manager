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
import useClickOutside from './hooks/useClickOutside'
import { motion, AnimatePresence } from 'motion/react'
import { BackgroundMask } from './Prompt'

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
        className={cn('absolute top-0 left-0 duration-200', {
          'scale-150 translate-y-0.5': isVis,
          'scale-1 translate-y-0': !isVis,
        })}
      >
        <Dot />
      </div>
      <div
        className={cn('absolute top-0 left-0 duration-200', {
          'opacity-0': isVis,
          'opacity-100': !isVis,
        })}
      >
        <DotsHorizontal />
      </div>
    </div>
  )
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
        setIsOpen(false)
      } else {
        setIsOpen(true)
      }
    },
    [isOpen],
  )

  useClickOutside(
    menuRef,
    () => {
      setIsOpen(false)
    },
    true,
  )

  useEffect(() => {
    function keyboardHandler(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false)
        return
      }
      setTimeout(() => {
        const menuEl = menuRef.current
        const focusedEl = menuEl?.querySelector(':focus')
        if (!focusedEl) {
          setIsOpen(false)
          return
        }
      }, 10)
    }
    if (isOpen) {
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

    return () => {
      document.removeEventListener('keydown', keyboardHandler)
    }
  }, [isOpen])

  function menuClickHandler(event: React.MouseEvent<HTMLDivElement>) {
    const t = event.target as HTMLElement
    if (t) {
      const isButton = t.localName === 'button'
      const isLink = t.localName === 'a'
      if (isButton || isLink) {
        setIsOpen(false)
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
  }, [menuRef, isOpen])

  useEffect(() => {
    if (focusOnMount) {
      menuTriggerRef?.current?.focus()
    }
  }, [])

  return (
    <>
      <div className={cn('pop-out-menu relative w-6 h-6')}>
        <button
          className={cn(
            'pop-out-menu-button absolute duration-150 shadow-primary cursor-pointer',
            'p-1',
            'bottom-0 left-0',
            'rounded-sm',
            { 'border-0 px-0 py-0': icon },
            'focus:outline-solid focus:outline-2 outline-constructive',
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
            <IconToUse isVis={isOpen} icon={icon} />
          </div>
        </button>
        <AnimatePresence mode="wait">
          {isOpen && (
            <>
              <motion.div
                key={POP_OUT_MENU_CLASS_NAME}
                initial={{
                  opacity: 0,
                  translateY: 2,
                  translateX: 6,
                  scaleY: 0.98,
                }}
                animate={{
                  opacity: 1,
                  translateY: 11,
                  translateX: 6,
                  scaleY: 1,
                }}
                transition={{ duration: 0.025, ease: 'backOut' }}
                exit={{
                  opacity: 0,
                  translateY: -36,
                  transition: { duration: 0.15, ease: 'easeOut' },
                }}
                className={cn(
                  POP_OUT_MENU_CLASS_NAME,
                  'absolute z-50 duration-150 p-3 rounded-sm shadow-glow-primary bg-background',
                  '-bottom-30 left-6',
                  menuClasses,
                )}
                ref={menuRef}
                onClick={menuClickHandler}
              >
                {children}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.4, ease: 'backOut' }}
          className={cn(
            'Prompt-background fixed top-0 bottom-0 left-0 right-0 bg-background opacity-30 shadow-glow-primary-inset z-10',
          )}
        />
      )}
    </>
  )
}
