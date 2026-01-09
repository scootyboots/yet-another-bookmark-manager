import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Prompt from './Prompt'
import { Bookmark, NewBookmark } from '../background'
import { EMPTY_BOOKMARK } from './NewTab'

function BookmarkPromptGroup({
  groupName,
  allGroupNames,
}: {
  groupName?: string
  allGroupNames: string[]
}) {
  return (
    <div className="group-name-container">
      <div className="BookmarkPrompt-group-name">{groupName}</div>
    </div>
  )
}

export default function BookmarkPrompt({
  isShown,
  setIsShown,
  groupNames,
  bookmark,
  setBookmark,
  addBookmark,
  updateBookmark,
}: {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  groupNames: string[]
  bookmark: Bookmark
  setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>
  addBookmark: (newBookmark: NewBookmark) => void
  updateBookmark: (bookmark: Bookmark) => void
  // existingBookmark: Bookmark
}) {
  const hrefInputRef = useRef<HTMLInputElement>(null)
  // const textInputRef = useRef<HTMLInputElement>(null)
  const [shouldExit, setShouldExit] = useState(false)
  const [shouldExecute, setShouldExecute] = useState(false)

  const { href, text, group } = useMemo(
    () => ({ href: bookmark.href, text: bookmark.text, group: bookmark.group }),
    [bookmark]
  )

  useMemo(() => {
    const isEmptyBk = bookmark.id === 0
    if (shouldExecute) {
      if (isEmptyBk) {
        addBookmark({ ...bookmark })
        setIsShown(false)
      } else {
        updateBookmark({ ...bookmark })
      }
    }
    if (shouldExit) {
      setIsShown(false)
    }
  }, [bookmark, shouldExecute, shouldExit])

  useEffect(() => {
    function keydownPromptHandler(event: KeyboardEvent) {
      const { key } = event
      if (key === 'Escape') {
        setShouldExit(true)
      }
      if (key === 'Enter') {
        setShouldExecute(true)
      }
    }

    document.addEventListener('keydown', keydownPromptHandler)
    return () => {
      document.removeEventListener('keydown', keydownPromptHandler)
    }
  }, [])

  useEffect(() => {
    if (hrefInputRef.current) {
      hrefInputRef.current.focus()
    }
    return () => {
      setBookmark({ ...EMPTY_BOOKMARK })
    }
  }, [isShown])

  return (
    <Prompt isShown={isShown}>
      <div className="BookmarkPrompt-content">
        <BookmarkPromptGroup groupName={group} allGroupNames={groupNames} />
        <div className="Bookmark-input-group">
          <label>
            <div>href</div>
            <div className="Search-result-divider">:</div>
          </label>
          <input
            onChange={(event) => {
              const value = event.target.value
              setBookmark((prev) => ({ ...prev, href: value }))
            }}
            type="text"
            value={href}
            ref={hrefInputRef}
          />
        </div>
        <div className="Bookmark-input-group">
          <label>
            <div>text</div>
            <div className="Search-result-divider">:</div>
          </label>
          <input
            onChange={(event) => {
              const value = event.target.value
              setBookmark((prev) => ({ ...prev, text: value }))
            }}
            type="text"
            value={text}
          />
        </div>
      </div>
    </Prompt>
  )
}
