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
import { BookmarkSorter } from './useBookmarkSorter'

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

  const confirmButtonText = useMemo(() => {
    if (type === 'new-bookmark') {
      return 'create bookmark'
    }
    if (type === 'new-group') {
      return 'create group'
    }
    if (type === 'update-bookmark') {
      return 'update'
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

  useMemo(() => {
    const isEmptyBk = bookmark.id === 0
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
  // TODO: SERIOUSLY THOUGH THIS NEEDS TO GO
  if (type === 'new-group') {
    return (
      <Prompt
        className={shakeX ? ' shakeX' : ''}
        isShown={isShown}
        setIsShown={setIsShown}
        ref={promptRef}
      >
        <div
          className="BookmarkPrompt-content"
          ref={contentRef}
          data-has-new-bookmark-data={hadNeededNewBookmarkProps}
          data-has-group={Boolean(group)}
          data-action-type={type}
        >
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
            <button data-prompt-create onClick={() => setShouldExecute(true)}>
              create
            </button>
          </div>
        </div>
      </Prompt>
    )
  }

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
          <button data-prompt-create onClick={() => setShouldExecute(true)}>
            {confirmButtonText}
          </button>
        </div>
      </div>
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
