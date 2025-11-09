import { useCallback, useEffect, useRef } from 'react'
import Prompt from './Prompt'
import { Bookmark, NewBookmark } from '../background'
import { EMPTY_BOOKMARK } from './NewTab'

export default function BookmarkPrompt({
  isShown,
  setIsShown,
  bookmark,
  setBookmark,
  type,
  addBookmark,
  updateBookmark,
}: {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
  bookmark: Bookmark
  setBookmark: React.Dispatch<React.SetStateAction<Bookmark>>
  type: 'add' | 'update'
  addBookmark: (newBookmark: NewBookmark) => void
  updateBookmark: (bookmark: Bookmark) => void
  // existingBookmark: Bookmark
}) {
  const hrefInputRef = useRef<HTMLInputElement>(null)
  // const textInputRef = useRef<HTMLInputElement>(null)

  const keydownPromptHandler = useCallback(
    (event: KeyboardEvent) => {
      console.log('PROMPT KEYBOARD LISTENER')
      const { key } = event
      if (key === 'Escape') {
        setIsShown(false)
      }
      if (key === 'Enter') {
        if (type === 'add') {
          addBookmark({ ...bookmark })
        }
        if (type === 'update') {
          updateBookmark({ ...bookmark })
        }
      }
    },
    [bookmark]
  )

  useEffect(() => {
    if (hrefInputRef.current) {
      hrefInputRef.current.focus()
    }

    document.addEventListener('keydown', keydownPromptHandler)
    return () => {
      document.removeEventListener('keydown', keydownPromptHandler)
      setBookmark(EMPTY_BOOKMARK)
    }
  }, [keydownPromptHandler])

  useEffect(() => {
    if (hrefInputRef.current) {
      hrefInputRef.current.focus()
    }
  }, [isShown])

  const { href, text } = bookmark

  if (!isShown) return null

  return (
    <Prompt isShown={isShown}>
      <div className="BookmarkPrompt-content">
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
