import { cn } from '@/lib/utils'
import { Ref, useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'
import { Carrot } from './Carrot'

export type SearchInputProps = {
  setInputText: (value: React.SetStateAction<string>) => void
  inputText: string
  ref: Ref<HTMLInputElement>
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void
  onKeydown?: (event: KeyboardEvent<HTMLInputElement>) => void
  placeholder?: string
  textMd?: boolean
}

export function SearchInput(props: SearchInputProps) {
  const {
    setInputText,
    inputText,
    ref: inputRef,
    onChange,
    placeholder = ' type to search...',
    onKeydown,
    textMd,
  } = props
  const [isInputIdle, setIsInputIdle] = useState(true)
  const maxCarrotLength = textMd ? 45 : 19
  return (
    <div className={cn('relative p-1.5 mx-16')}>
      <input
        className={cn(
          'border-0 bg-transparent text-white font-mono focus:outline-none w-full caret-transparent placeholder-neutral-600',
          { 'text-lg': !textMd },
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
        <Carrot
          isIdle={isInputIdle}
          isVisible={inputText === ''}
          textMd={textMd}
        />
        {inputText.split('').map((_, i) => {
          const isLast = i + 1 === inputText.length
          const isTooMany = i > maxCarrotLength

          return !isTooMany ? (
            <Carrot
              isIdle={isInputIdle}
              isVisible={isLast || isTooMany}
              textMd={textMd}
            />
          ) : null
        })}
        <Carrot
          isVisible={inputText.length > 20}
          isIdle={isInputIdle}
          textMd={textMd}
        />
      </div>
    </div>
  )
}
