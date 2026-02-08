import Prompt from './Prompt'
import { Select } from './BookmarkPrompt'

export type CommandLineProps = {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  commands: Array<{ action: () => void; name: string }>
}

export default function CommandLine(props: CommandLineProps) {
  const { commands, setIsShown, isShown } = props
  return (
    <Prompt isShown={isShown} setIsShown={setIsShown}>
      <input />
      <Select
        options={['', 'add-bookmark', 'add-group']}
        onChange={(e) => {
          const value = e.target.value
          console.log(value)
          const command = commands.find((c) => c.name === value)
          if (command) {
            console.log(command)
            command?.action()
            setIsShown(false)
          }
        }}
      />
    </Prompt>
  )
}
