import { cn } from '@/lib/utils'
import { Ref, useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { useAnimate } from 'motion/react'

export type SearchInputProps = {
  setInputText: (value: React.SetStateAction<string>) => void
  inputText: string
  ref: Ref<HTMLInputElement>
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onKeydown?: (event: KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
}

export function SearchInput(props: SearchInputProps) {
  const {
    setInputText,
    inputText,
    ref: inputRef,
    onChange,
    placeholder = ' type to search...',
    onKeydown,
  } = props
  const [isInputIdle, setIsInputIdle] = useState(true)
  return (
    <div className={cn('relative p-1.5 mx-16')}>
      <input
        className={cn(
          'border-0 bg-transparent text-white text-lg font-mono focus:outline-none w-full caret-transparent placeholder-neutral-600',
        )}
        placeholder={placeholder}
        onChange={(e) => {
          onChange?.(e)
          setInputText?.(e.target.value)
          if (e.target.value === '') {
            setIsInputIdle(true)
            return
          }
          if (isInputIdle) {
            setIsInputIdle(false)
          }
          setTimeout(() => {
            setIsInputIdle(true)
          }, 1250)
        }}
        name="bookmark search"
        type="text"
        value={inputText}
        ref={inputRef}
        onKeyDown={(e) => onKeydown?.(e)}
        tabIndex={0}
      />
      <div className={cn('carrot flex flex-nowrap absolute bottom-1.5')}>
        <Carrot isIdle={isInputIdle} isVisible={inputText === ''} />
        {inputText.split('').map((_, i) => {
          const isLast = i + 1 === inputText.length
          const isTooMany = i > 19

          return !isTooMany ? (
            <Carrot isIdle={isInputIdle} isVisible={isLast || isTooMany} />
          ) : null
        })}
        <Carrot isVisible={inputText.length > 20} isIdle={isInputIdle} />
      </div>
    </div>
  )
}

export function Carrot({
  isIdle,
  isVisible,
}: {
  isIdle: boolean
  isVisible: boolean
}) {
  const [scope, animate] = useAnimate()

  useEffect(() => {
    if (isVisible && isIdle) {
      animate(
        scope.current,
        { opacity: [1, 0, 1] },
        {
          duration: 0.95,
          ease: 'linear',
          repeat: Infinity,
        },
      )
    }
  }, [isIdle, isVisible])
  return (
    <div
      ref={scope}
      className={cn('w-2.75 h-1', {
        'bg-primary': isVisible,
      })}
    />
  )
}
