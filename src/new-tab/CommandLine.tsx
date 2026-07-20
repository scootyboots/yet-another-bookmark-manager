import { ChangeEvent, useCallback, useMemo, useRef, useState } from 'react'
import Prompt from './Prompt'
import { cn } from '@/lib/utils'
import { SearchInput } from './Search/SearchInput'

export const USER = 'motoko'

export type Command = { action: () => void; name: string; hotKey: string }

export type CommandLineProps = {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  commands: Command[]
}

export default function CommandLine(props: CommandLineProps) {
  const { commands, setIsShown, isShown } = props
  const [matching, setMatching] = useState<Command[]>(commands)
  const [inputText, setInputText] = useState('')
  const inputRef = useRef(null)
  const noMatchingCommand = useMemo(() => !Boolean(matching.length), [matching])
  function executeAction(action: () => void | undefined) {
    setTimeout(() => {
      action?.()
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
      contentClasses={cn(
        'px-2 py-8 relative overflow-visible w-lg',
        // 'p-2 rounded-full relative overflow-visible w-lg'
      )}
      unstyled
    >
      <div className={cn('flex flex-col gap-2')}>
        <div
          className={
            cn()
            // 'rounded-full border border-primary shadow-glow-primary bg-background',
          }
        >
          <div className={cn('font-mono bg-none mx-17 pt-1 text-[1rem]')}>
            <span className={cn('text-constructive font-bold')}>
              {USER}@bookmarks
            </span>
            <span className={cn('text-white')}>:</span>
            <span className={'text-primary'}> ~ </span>
            <span>command -list</span>
            {matching.map((cmd, index) => {
              return (
                <div className={'flex flex-nowrap gap-8'}>
                  <div className={cn('text-primary font-bold')}>
                    {cmd.hotKey}
                  </div>
                  <div>{cmd.name}</div>
                </div>
              )
            })}
            {noMatchingCommand && inputText ? (
              <div className={cn('')}>command not found</div>
            ) : null}
          </div>
          <SearchInput
            inputText={inputText}
            setInputText={setInputText}
            placeholder=""
            ref={inputRef}
            onChange={changeHandler}
            onKeydown={(e) => {
              if (e.key === 'Enter') {
                executeAction(matching[0]?.action)
              }
            }}
            // textMd
          />
        </div>
      </div>
    </Prompt>
  )
}
