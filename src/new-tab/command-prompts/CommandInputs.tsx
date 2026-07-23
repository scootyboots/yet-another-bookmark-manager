import { cn } from '@/lib/utils'
import { atom, useAtom, useAtomValue } from 'jotai'
import {
  bookmarksAtom,
  PromptCommands,
  selectedBookmarkAtom,
} from '../bookmark-controller/bookmark-atoms'
import { ChangeEvent, PropsWithChildren, useEffect, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { IGNORE_CLICK_OUTSIDE_ATTRIBUTE } from '../hooks/useClickOutside'

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
          <CommandSelectGroup
            options={allGroups}
            name="new-bookmark"
            onChange={(value) => {
              setSelectedBookmark({ ...selectedBookmark, group: value })
            }}
          >
            group
          </CommandSelectGroup>
        </>
      )}
      {command === 'update-bookmark' && <></>}
      {command === 'new-group' && <></>}
      {command === 'update-group' && <></>}
      {command === 'remove-group' && <></>}
    </div>
  )
}

function CommandGroup({ children }: PropsWithChildren) {
  return (
    <div className={cn('Bookmark-input-group flex gap-4 items-baseline mb-4')}>
      {children}
    </div>
  )
}

function CommandLabel({
  name,
  children,
}: { name: string } & PropsWithChildren) {
  return (
    <label className={cn('w-14.5 font-mono text-[1rem]')} htmlFor={name}>
      {children}
    </label>
  )
}

type CommandInputGroupProps = {
  name: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
} & PropsWithChildren

export function CommandInputGroup(props: CommandInputGroupProps) {
  const { value, name, onChange, children } = props
  return (
    <CommandGroup>
      <CommandLabel name={name}>{children}</CommandLabel>
      {/* <div className={cn('Search-result-divider w-4')}>:</div> */}
      <Input onChange={onChange} type="text" value={value} name={name} />
    </CommandGroup>
  )
}

type CommandSelectGroupProps = {
  name: string
  options: string[]
  onChange: (valueChange: string) => void
} & PropsWithChildren

export function CommandSelectGroup(props: CommandSelectGroupProps) {
  const { options, name, children, onChange } = props
  return (
    <CommandGroup>
      <CommandLabel name={name}>{children}</CommandLabel>
      <NativeSelect
        className={cn('w-full')}
        onChange={(e) => onChange(e.target.value)}
      >
        <NativeSelectOption value=""></NativeSelectOption>
        {options.map((group) => (
          <NativeSelectOption value={group}>{group}</NativeSelectOption>
        ))}
      </NativeSelect>
    </CommandGroup>
  )
}

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
