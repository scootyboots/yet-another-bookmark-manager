import { useCallback, useState } from 'react'
import Prompt from './Prompt'
import { cn } from '@/lib/utils'

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

  function executeAction(action: () => void) {
    setTimeout(() => {
      action()
      setIsShown(false)
    }, 10)
  }

  return (
    <Prompt
      isShown={isShown}
      setIsShown={setIsShown}
      contentClasses={cn('p-2 rounded-full relative overflow-visible w-lg')}
    >
      <div className={cn('relative')}>
        <input
          className={cn('focus:outline-0 border-b-0 mbe-0 ms-8')}
          onChange={(e) => {
            const value = e.target.value
            const trimmed = value.toLowerCase().trim()
            const hotKeyMatch = commands.find((c) => c.hotKey === trimmed)
            if (hotKeyMatch) {
              executeAction(hotKeyMatch.action)
              return
            }
            const filtered = commands.filter((c) => c.name.includes(trimmed))
            setMatching(filtered)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              executeAction(matching[0].action)
            }
          }}
        />

        <div
          className={cn(
            'absolute flex flex-col gap-1.5 content-center -bottom-28 w-full font-mono text-sm',
          )}
        >
          <div
            className={cn(
              'flex w-full flex-col gap-1.5 content-center items-center',
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
                    {com.name}{' '}
                    <span className={'text-primary font-bold'}>
                      - {com.hotKey}
                    </span>
                  </div>
                  {/* {!isLast && (
                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  - ({hotKey})
                </div>
              )} */}
                </>
              )
            })}
          </div>
        </div>
      </div>
    </Prompt>
  )
}
