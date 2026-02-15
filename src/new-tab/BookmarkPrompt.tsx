import {
  ChangeEvent,
  ChangeEventHandler,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Prompt from './Prompt'
import { Bookmark, NewBookmark } from '../background'
import { EMPTY_BOOKMARK } from './NewTab'

function BookmarkPromptGroup({
  groupName,
  allGroupNames,
}: {
  groupName?: string
  allGroupNames?: string[]
}) {
  return (
    <div className="group-name-container">
      <div className="BookmarkPrompt-group-name">{groupName}</div>
    </div>
  )
}

export function Select({
  options,
  onChange,
}: {
  options: string[]
  onChange: ChangeEventHandler<HTMLSelectElement>
}) {
  return (
    <div className="group-name-selector">
      <select
        onChange={onChange}
        style={{
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: 'var(--primary-weak)',
          padding: 0,
          margin: 0,
          paddingInline: '0.6rem',
          paddingBlock: '0.4rem',
          borderRadius: '0.4rem',
          backgroundColor: 'var(--background-weak)',
          color: 'var(--foreground)',
        }}
      >
        {options.map((name) => {
          // const optionValue = name.toLocaleLowerCase().replace(' ', '-')
          // TODO: provide actual values
          return <option value={name}>{name}</option>
        })}
      </select>
    </div>
  )
}

export type BookmarkPromptType =
  | 'new-bookmark'
  | 'new-group'
  | 'update-bookmark'

export type BookmarkPromptProps = {
  type: BookmarkPromptType
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  groupNames: string[]
  bookmark: Bookmark
  setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>
  addBookmark: (newBookmark: NewBookmark) => void
  updateBookmark: (bookmark: Bookmark) => void
  addGroup: (groupName: string, groupIndex: number, col: number) => void
  getNextGroupIndex: (col: number) => number
  findGroupColumNumber: (groupName: string) => number
}

export default function BookmarkPrompt(props: BookmarkPromptProps) {
  const {
    type,
    isShown,
    setIsShown,
    groupNames,
    bookmark,
    setBookmark,
    addBookmark,
    updateBookmark,
    addGroup,
    getNextGroupIndex,
    findGroupColumNumber,
  } = props
  const contentRef = useRef<HTMLInputElement>(null)
  const [shouldExit, setShouldExit] = useState(false)
  const [shouldExecute, setShouldExecute] = useState(false)

  const { href, text, group } = useMemo(
    () => ({ href: bookmark.href, text: bookmark.text, group: bookmark.group }),
    [bookmark],
  )

  useMemo(() => {
    const isEmptyBk = bookmark.id === 0
    if (shouldExecute) {
      if (type === 'new-bookmark') {
        addBookmark({ ...bookmark })
        setIsShown(false)
      }
      if (type === 'update-bookmark') {
        updateBookmark({ ...bookmark })
      }
      if (type === 'new-group') {
        addGroup(bookmark.group, getNextGroupIndex(bookmark.col), bookmark.col)
      }
    }
    if (shouldExit) {
      setIsShown(false)
    }
  }, [bookmark, shouldExecute, shouldExit, type])

  useEffect(() => {
    function keydownPromptHandler(event: KeyboardEvent) {
      console.log(
        "if you're seeing this message too much you have not properly removed the event listener",
      )
      const { key } = event
      if (key === 'Escape') {
        setShouldExit(true)
      }
      if (key === 'Enter') {
        setShouldExecute(true)
        setShouldExit(true)
      }
    }

    document.addEventListener('keydown', keydownPromptHandler)
    return () => {
      document.removeEventListener('keydown', keydownPromptHandler)
    }
  }, [])

  useEffect(() => {
    const contentEl = contentRef.current
    if (contentEl) {
      const firstInteractiveEl = contentEl.querySelector<HTMLButtonElement>(
        'a, button, input, select, textarea',
      )
      firstInteractiveEl?.focus()
    }
    return () => {
      setBookmark({ ...EMPTY_BOOKMARK })
    }
  }, [isShown])

  // TODO: remove need for this early return
  if (type === 'new-group') {
    return (
      <Prompt isShown={isShown} setIsShown={setIsShown}>
        <div className="BookmarkPrompt-content" ref={contentRef}>
          <BookmarkPromptGroup groupName="new group" />
          <BookmarkInputGroup
            label="name"
            value={group}
            onChange={(event) => {
              const value = event.target.value
              setBookmark((prev) => ({
                ...prev,
                group: value,
              }))
            }}
          />
          <SelectGroup
            label={'col'}
            options={['1', '2', '3', '4']}
            onChange={(event) => {
              const value = Number(event.target.value)
              setBookmark((prev) => ({ ...prev, col: value }))
            }}
          />
        </div>
      </Prompt>
    )
  }

  return (
    <Prompt isShown={isShown} setIsShown={setIsShown}>
      <div className="BookmarkPrompt-content" ref={contentRef}>
        {group ? (
          <BookmarkPromptGroup groupName={group} />
        ) : (
          <SelectGroup
            label="group"
            options={groupNames}
            onChange={(e) => {
              console.log(e.target.value)
              const value = e.target.value
              console.log('group name: ', value, 'group')
              setBookmark((prev) => ({
                ...prev,
                group: value,
                // TODO: not working
                col: findGroupColumNumber(value),
              }))
            }}
          />
        )}
        <BookmarkInputGroup
          label="href"
          value={href}
          onChange={(event) => {
            const value = event.target.value
            setBookmark((prev) => ({ ...prev, href: value }))
          }}
        />
        <BookmarkInputGroup
          label="text"
          value={text}
          onChange={(event) => {
            const value = event.target.value
            setBookmark((prev) => ({ ...prev, text: value }))
          }}
        />
      </div>
      {/* {!group && (
        <SelectGroup
          label={'col'}
          options={['1', '2', '3', '4']}
          onChange={(e) => console.log(e.target.value)}
        />
      )} */}
    </Prompt>
  )
}

function SelectGroup({
  label,
  options,
  onChange,
}: {
  label: string
  options: string[]
  onChange: ChangeEventHandler<HTMLSelectElement>
}) {
  return (
    <div className="Bookmark-input-group">
      <label>
        <div>{label}</div>
        <div className="Search-result-divider">:</div>
      </label>
      <Select options={options} onChange={onChange} />
    </div>
  )
}

function BookmarkInputGroup({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="Bookmark-input-group">
      <label>
        <div>{label}</div>
        <div className="Search-result-divider">:</div>
      </label>
      <input onChange={onChange} type="text" value={value} />
    </div>
  )
}
