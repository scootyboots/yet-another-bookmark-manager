import {
  ChangeEvent,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { cn } from '@/lib/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  bookmarksAtom,
  PromptCommands,
  selectedBookmarkAtom,
} from '../bookmark-controller/bookmark-atoms'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { motion, useAnimate } from 'motion/react'
import { CircleNotchIcon, SwapIcon } from '@phosphor-icons/react'

const groupsAtom = atom<string[]>([])

export type CommandInputsProps = {
  command: PromptCommands
}

export default function CommandInputs(props: CommandInputsProps) {
  const { command } = props
  const [selectedBookmark, setSelectedBookmark] = useAtom(selectedBookmarkAtom)
  const bookmarks = useAtomValue(bookmarksAtom)
  const allGroups = useMemo(
    () =>
      [...new Set(bookmarks.map((bk) => bk.group))].filter((group) => group),
    [bookmarks],
  )
  const [isNewGroupSelected, setIsNewGroupSelected] = useState(false)
  const [isTransitionInput, setIsTransitionInput] = useState(false)

  useEffect(() => {
    console.log('ALL GROUPS')
    console.log(allGroups)
  }, [allGroups])
  return (
    <div className={cn('command-inputs')}>
      {command === 'new-bookmark' && (
        <>
          <CommandInputGroup
            name="add-bookmark"
            value={selectedBookmark.href}
            onChange={(event) => {
              setSelectedBookmark({
                ...selectedBookmark,
                href: event.target.value,
              })
            }}
          >
            href
          </CommandInputGroup>
          <CommandInputGroup
            name="add-bookmark"
            value={selectedBookmark.text}
            onChange={(event) => {
              setSelectedBookmark({
                ...selectedBookmark,
                text: event.target.value,
              })
            }}
          >
            text
          </CommandInputGroup>
          {isNewGroupSelected ? (
            <CommandInputGroup
              name="add-bookmark"
              value={selectedBookmark.group}
              focusOnMount
              onChange={(event) => {
                setSelectedBookmark({
                  ...selectedBookmark,
                  group: event.target.value,
                })
              }}
            >
              group
            </CommandInputGroup>
          ) : (
            <CommandSelectGroup
              options={allGroups}
              name="new-bookmark"
              onValueChange={(value) => {
                if (value === NEW_GROUP_OPTION_VALUE) {
                  setSelectedBookmark({ ...selectedBookmark, group: '' })
                  setIsNewGroupSelected(true)
                  return
                }
                setSelectedBookmark({ ...selectedBookmark, group: value })
              }}
              newGroupOption
            >
              group
            </CommandSelectGroup>
          )}
        </>
      )}
      {command === 'update-bookmark' && (
        <>
          <CommandInputGroup
            name="href"
            value={selectedBookmark.href}
            onChange={(event) => {
              setSelectedBookmark({
                ...selectedBookmark,
                href: event.target.value,
              })
            }}
          >
            href
          </CommandInputGroup>
          <CommandInputGroup
            name="text"
            value={selectedBookmark.text}
            onChange={(event) => {
              setSelectedBookmark({
                ...selectedBookmark,
                text: event.target.value,
              })
            }}
          >
            text
          </CommandInputGroup>
        </>
      )}
      {command === 'new-group' && <></>}
      {command === 'update-group' && <></>}
      {command === 'remove-group' && <></>}
    </div>
  )
}

function CommandGroup({ children }: PropsWithChildren) {
  return (
    <div
      className={cn('Bookmark-input-group flex gap-4 items-baseline mb-4 h-8')}
    >
      {children}
    </div>
  )
}

function CommandLabel({
  name,
  children,
}: { name: string } & PropsWithChildren) {
  return (
    <label className={cn('w-13.5 font-mono text-sm text-end')} htmlFor={name}>
      {children}
    </label>
  )
}

function SpinnerIcon({ children }: PropsWithChildren) {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 0.75, repeat: Infinity, ease: 'easeInOut' }}
      // className={cn('w-4')}
    >
      {children}
    </motion.div>
  )
}

function SpinnerCircle() {
  return (
    <SpinnerIcon>
      <CircleNotchIcon color="var(--primary)" weight="bold" />
    </SpinnerIcon>
  )
}

function SwapIconAnimated() {
  return (
    <motion.div
      animate={{ x: [0, 6, 0] }}
      transition={{ duration: 0.075, ease: 'linear' }}
      className={'h-6'}
    >
      <SwapIcon color="var(--primary)" size={24} />
    </motion.div>
  )
}

type CommandInputGroupProps = {
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
  focusOnMount?: boolean
  divider?: boolean
  enterAnimation?: boolean
} & PropsWithChildren

export function CommandInputGroup(props: CommandInputGroupProps) {
  const {
    value,
    name,
    onChange,
    focusOnMount = false,
    divider,
    children,
    enterAnimation,
  } = props
  const [scope, animate] = useAnimate<HTMLInputElement>()

  useEffect(() => {
    if (focusOnMount) {
      animate(
        scope.current,
        { y: [6, 0] },
        { duration: 0.0575, ease: 'easeInOut' },
      )
      if (enterAnimation) {
        setTimeout(() => {
          scope.current?.focus()
        }, 125)
      } else {
        scope.current?.focus()
      }
    }
  }, [])
  return (
    <CommandGroup>
      <CommandLabel name={name}>{children}</CommandLabel>
      {divider && <div className={cn('Search-result-divider w-4')}>:</div>}
      <Input
        onChange={onChange}
        type="text"
        value={value}
        name={name}
        ref={scope}
      />
    </CommandGroup>
  )
}

const NEW_GROUP_OPTION_VALUE = 'new-group-prompt-user'

type CommandSelectGroupProps = {
  name: string
  options: string[]
  onValueChange: (value: string) => void
  newGroupOption?: boolean
  isTransitioning?: boolean
} & PropsWithChildren

export function CommandSelectGroup(props: CommandSelectGroupProps) {
  const {
    options,
    name,
    children,
    onValueChange,
    newGroupOption,
    isTransitioning,
  } = props
  return (
    <CommandGroup>
      <CommandLabel name={name}>{children}</CommandLabel>
      <NativeSelect
        className={cn('w-full')}
        onChange={(e) => onValueChange(e.target.value)}
      >
        <NativeSelectOption value=""></NativeSelectOption>
        {newGroupOption && (
          <NativeSelectOption value={NEW_GROUP_OPTION_VALUE}>
            CREATE NEW GROUP
          </NativeSelectOption>
        )}
        {options.map((group) => (
          <NativeSelectOption value={group}>{group}</NativeSelectOption>
        ))}
      </NativeSelect>
    </CommandGroup>
  )
}

// TODO: figure out why having trouble with non-native select inside of modals

// export function CommandSelectGroup(props: CommandSelectGroupProps) {
//   const { options, name, children, onChange } = props
//   return (
//     <CommandGroup>
//       <CommandLabel name={name}>{children}</CommandLabel>
//       <Select name={name} onValueChange={onChange}>
//         <SelectTrigger>
//           <SelectValue>group</SelectValue>
//         </SelectTrigger>
//         <SelectContent className={cn('z-60')} data-ignore-click-outside>
//           <SelectGroup>
//             <SelectLabel>groups</SelectLabel>
//             {options.map((group) => (
//               <SelectItem value={group}>{group}</SelectItem>
//             ))}
//           </SelectGroup>
//         </SelectContent>
//       </Select>
//     </CommandGroup>
//   )
// }
