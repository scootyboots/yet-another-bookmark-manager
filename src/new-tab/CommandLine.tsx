import { ChangeEvent, useCallback, useRef, useState } from 'react'
import Prompt from './Prompt'
import { cn } from '@/lib/utils'
import { SearchInput } from './Search/SearchInput'

export type Command = { action: () => void; name: string; hotKey: string }

export type CommandLineProps = {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  commands: Command[]
}

const commandSearchRegex = / /i

export default function CommandLine(props: CommandLineProps) {
  const { commands, setIsShown, isShown } = props
  const [matching, setMatching] = useState<Command[]>(commands)
  const [inputText, setInputText] = useState('')
  const inputRef = useRef(null)
  function executeAction(action: () => void) {
    setTimeout(() => {
      action()
      setIsShown(false)
    }, 10)
  }

  function changeHandler(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value
    const trimmed = value.toLowerCase().trim()
    const hotKeyMatch = commands.find((c) => c.hotKey === trimmed)
    if (hotKeyMatch) {
      executeAction(hotKeyMatch.action)
      return
    }
    const filtered = commands.filter((c) => c.name.includes(trimmed))
    setMatching(filtered)
  }

  return (
    <Prompt
      isShown={isShown}
      setIsShown={setIsShown}
      contentClasses={cn('p-2 rounded-full relative overflow-visible w-lg')}
      unstyled
    >
      <div className={cn('flex flex-col gap-2')}>
        <div
          className={cn(
            'rounded-full border border-primary shadow-glow-primary bg-background',
          )}
        >
          <SearchInput
            inputText={inputText}
            setInputText={setInputText}
            placeholder=" command name or key combination"
            ref={inputRef}
            onChange={changeHandler}
            onKeydown={(e) => {
              if (e.key === 'Enter') {
                executeAction(matching[0].action)
              }
            }}
          />
        </div>
        <div
          className={cn(
            'flex w-full flex-col gap-1.5 content-center items-center text-[1rem]',
          )}
        >
          {matching.map((com, index) => {
            const isLast = index + 1 === matching.length
            const hotKey = (
              <span className={'text-primary font-bold'}>{com.hotKey}</span>
            )
            return (
              <>
                <div>
                  {com.name} :{' '}
                  <span className={'text-primary font-bold'}>{com.hotKey}</span>
                </div>
              </>
            )
          })}
        </div>
      </div>
    </Prompt>
  )
}
