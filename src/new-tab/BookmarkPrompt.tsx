import {
  ChangeEvent,
  ChangeEventHandler,
  PropsWithChildren,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import Prompt from './Prompt'
import { Bookmark, NewBookmark } from '../background'
import { EMPTY_BOOKMARK } from './NewTab'
import { BookmarkSorter } from './useBookmarkSorter'

function BookmarkPromptGroup({
  groupName,
  allGroupNames,
  promptType,
  children,
}: PropsWithChildren<{
  groupName?: string
  allGroupNames?: string[]
  promptType: BookmarkPromptType
}>) {
  const findNameToUse = () => {
    if (promptType === 'new-bookmark') {
      return 'new bookmark'
    }
    if (promptType === 'new-group') {
      return 'new group'
    }
    if (promptType === 'update-bookmark') {
      return 'update bookmark'
    }
  }
  return (
    <div className="group-name-container">
      <div className="BookmarkPrompt-group-name">{findNameToUse()}</div>
      {children}
    </div>
  )
}

export function Select({
  name,
  options,
  initialValue,
  onChange,
  firstOptionEmpty,
}: {
  name: string
  options: string[]
  initialValue?: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  firstOptionEmpty: boolean
}) {
  const optionsToUse = firstOptionEmpty ? ['', ...options] : options
  return (
    <div className="group-name-selector">
      <select
        name={name}
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
        {optionsToUse.map((name) => {
          const selected = name === initialValue

          if (selected) {
            return (
              <option value={name} selected>
                {name}
              </option>
            )
          }
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
  bookmark: Bookmark
  setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>
  addBookmark: (newBookmark: NewBookmark) => void
  updateBookmark: (bookmark: Bookmark) => void
  addGroup: (groupName: string, groupIndex: number, col: number) => void
} & BookmarkSorter

export default function BookmarkPrompt(props: BookmarkPromptProps) {
  const {
    type,
    isShown,
    setIsShown,
    bookmark,
    setBookmark,
    addBookmark,
    updateBookmark,
    addGroup,
    groupNames,
    getColumnGroupIndex,
    findGroupProperties,
  } = props

  const contentRef = useRef<HTMLInputElement>(null)
  const [shouldExit, setShouldExit] = useState(false)
  const [shouldExecute, setShouldExecute] = useState(false)
  const [shakeX, setShakeX] = useState(false)
  const promptRef = useRef<HTMLDivElement>(null)

  const { href, text, group } = useMemo(
    () => ({ href: bookmark.href, text: bookmark.text, group: bookmark.group }),
    [bookmark],
  )

  const {
    confirmButtonText,
    isCreateNewBk,
    isCreateNewGroup,
    isUpdateBookmark,
  } = useMemo(() => {
    let confirmButtonText = ''
    let isCreateNewBk = false
    let isCreateNewGroup = false
    let isUpdateBookmark = false
    if (type === 'new-bookmark') {
      confirmButtonText = 'create bookmark'
      isCreateNewBk = true
    }
    if (type === 'new-group') {
      confirmButtonText = 'create group'
      isCreateNewGroup = true
    }
    if (type === 'update-bookmark') {
      confirmButtonText = 'update'
      isUpdateBookmark = true
    }
    return {
      confirmButtonText,
      isCreateNewBk,
      isCreateNewGroup,
      isUpdateBookmark,
    }
  }, [type])

  const hadNeededNewBookmarkProps =
    Boolean(href) && Boolean(text) && Boolean(group)

  const handleShake = () => {
    setShakeX(true)
    setTimeout(() => {
      setShakeX(false)
    }, 85)
  }

  const { selectedBkHasGroup } = useMemo(() => {
    const selectedBkHasGroup = Boolean(bookmark.group)
    if (shouldExecute) {
      if (type === 'new-bookmark') {
        const newBk = { ...bookmark }
        const hasNeededProps = newBk.text && newBk.href && newBk.group
        if (hasNeededProps) {
          addBookmark(newBk)
          setIsShown(false)
        }
      }
      if (type === 'update-bookmark') {
        updateBookmark({ ...bookmark })
      }
      if (type === 'new-group') {
        const { next } = getColumnGroupIndex(bookmark.col)
        addGroup(bookmark.group, next, bookmark.col)
      }
    }
    if (shouldExit) {
      setIsShown(false)
    }
    return { selectedBkHasGroup }
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
        const activeEl = document.activeElement
        const isCancelButton = activeEl?.getAttribute('data-prompt-cancel')
        if (isCancelButton) return
        const hasNewBkData = document.querySelector(
          '[data-has-new-bookmark-data="true"]',
        )
        const isNewBkPrompt = document.querySelector(
          '[data-action-type="new-bookmark"]',
        )
        if (isNewBkPrompt && !hasNewBkData) {
          handleShake()
          return
        }

        const isNewGroupPrompt = document.querySelector(
          '[data-action-type="new-group"]',
        )
        const hasGroup = document.querySelector('[data-has-group="true"]')

        if (isNewGroupPrompt && !hasGroup) {
          handleShake()
          return
        }

        setShouldExecute(true)
        setShouldExit(true)
      }
    }

    document.addEventListener('keydown', keydownPromptHandler)
    return () => {
      document.removeEventListener('keydown', keydownPromptHandler)
      setBookmark({ ...EMPTY_BOOKMARK })
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

  return (
    <Prompt
      isShown={isShown}
      setIsShown={setIsShown}
      className={shakeX ? ' shakeX' : ''}
      ref={promptRef}
    >
      <div
        className="BookmarkPrompt-content"
        ref={contentRef}
        data-has-new-bookmark-data={hadNeededNewBookmarkProps}
        data-has-group={Boolean(group)}
        data-action-type={type}
      >
        <BookmarkPromptGroup groupName={group} promptType={type} />
        {isCreateNewBk && (
          <SelectGroup
            label="group"
            name="group-name"
            options={groupNames}
            initialValue=""
            setBookmark={setBookmark}
            selectedBookmark={bookmark}
            firstOptionEmpty={selectedBkHasGroup ? false : true}
            onChange={(e) => {
              console.log(e.target.value)
              const value = e.target.value
              console.log('group name: ', value, 'group')
              setBookmark((prev) => {
                const { col, groupIndex } = findGroupProperties(value)
                return {
                  ...prev,
                  group: value,
                  col,
                  groupIndex,
                }
              })
            }}
          />
        )}

        {isCreateNewBk || isUpdateBookmark ? (
          <>
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
          </>
        ) : null}

        {isCreateNewGroup && (
          <>
            <BookmarkInputGroup
              label="group"
              value={group}
              onChange={(event) => {
                const value = event.target.value
                setBookmark((prev) => ({ ...prev, group: value }))
              }}
            />
            <SelectGroup
              name="column-number"
              label="col"
              options={['1', '2', '3', '4']}
              initialValue={`${bookmark.col}`}
              setBookmark={setBookmark}
              selectedBookmark={bookmark}
              firstOptionEmpty={false}
              onChange={(event) => {
                const value = Number(event.target.value)
                setBookmark((prev) => ({ ...prev, col: value }))
              }}
            />
          </>
        )}
        <div
          style={{
            display: 'flex',
            gap: '0.4rem',
            justifyContent: 'space-evenly',
          }}
        >
          <button data-prompt-cancel onClick={() => setIsShown(false)}>
            cancel
          </button>
          <button
            data-prompt-create
            onClick={() => {
              setShouldExecute(true)
              setShouldExit(true)
            }}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </Prompt>
  )
}

function SelectGroup({
  label,
  name,
  options,
  initialValue,
  onChange,
  setBookmark,
  firstOptionEmpty,
  selectedBookmark,
}: {
  label: string
  name: string
  options: string[]
  initialValue?: string
  onChange: ChangeEventHandler<HTMLSelectElement>
  setBookmark: (value: React.SetStateAction<Bookmark>) => void
  firstOptionEmpty: boolean
  selectedBookmark: Bookmark
}) {
  const hasGroup = Boolean(selectedBookmark.group)
  const isColSelect = label === 'col'

  useEffect(() => {
    if (initialValue) return
    if (firstOptionEmpty) {
      setBookmark((prev) => ({ ...prev, group: '' }))
      return
    }
    if (hasGroup && !isColSelect) {
      return
    }
    const firstOption = options[0]
    const firstAsNumber = Number(firstOption)
    if (isNaN(firstAsNumber)) {
      setBookmark((prev) => ({ ...prev, group: firstOption }))
    } else {
      setBookmark((prev) => ({ ...prev, col: firstAsNumber }))
    }
  }, [])

  return (
    <div className="Bookmark-input-group">
      <label htmlFor={name}>
        <div>{label}</div>
        <div className="Search-result-divider">:</div>
      </label>
      {hasGroup && !isColSelect ? (
        <div className="text">{selectedBookmark.group}</div>
      ) : (
        <Select
          name={name}
          initialValue={initialValue}
          options={options}
          onChange={onChange}
          firstOptionEmpty={firstOptionEmpty}
        />
      )}
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
