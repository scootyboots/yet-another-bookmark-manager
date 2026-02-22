import { useCallback, useState } from 'react'
import Prompt from './Prompt'

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
      contentStyles={{
        paddingInline: '0.5rem',
        paddingBlock: '0.5rem',
        borderRadius: '2rem',
        position: 'relative',
        overflow: 'visible',
      }}
    >
      <input
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
        style={{ borderBottomWidth: '0px', marginBlockEnd: '0px' }}
      />
      <div
        style={{
          display: 'flex',
          gap: '0.4rem',
          flexWrap: 'nowrap',
          justifyContent: 'center',
          position: 'absolute',
          bottom: '-2rem',
          width: '100%',
          fontFamily: 'monospace',
          fontSize: '0.8rem',
        }}
      >
        {matching.map((com, index) => {
          const isLast = index + 1 === matching.length
          return (
            <>
              <div>{`${com.name} (${com.hotKey})`}</div>
              {!isLast && (
                <div style={{ fontWeight: 'bold', color: 'var(--primary)' }}>
                  |
                </div>
              )}
            </>
          )
        })}
      </div>
    </Prompt>
  )
}
