import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Prompt from './Prompt'
import { Bookmark, NewBookmark } from '../background'
import { EMPTY_BOOKMARK } from './NewTab'

export default function BookmarkPrompt({
  isShown,
  setIsShown,
  bookmark,
  setBookmark,
  addBookmark,
  updateBookmark,
}: {
  isShown: boolean
  setIsShown: React.Dispatch<React.SetStateAction<boolean>>
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

  const { href, text } = useMemo(
    () => ({ href: bookmark.href, text: bookmark.text }),
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

  // const keydownPromptHandler = useCallback((event: KeyboardEvent) => {
  //   console.log('BOOKMARK PROMPT KEYBOARD LISTENER')
  //   const { key } = event
  //   if (key === 'Escape') {
  //     setShouldExit(true)
  //   }
  //   if (key === 'Enter') {
  //     setShouldExecute(true)
  //   }
  // }, [])

  useEffect(() => {
    console.log('MOUNT BOOKMARK PROMPT')
    function keydownPromptHandler(event: KeyboardEvent) {
      console.log('BOOKMARK PROMPT KEYBOARD LISTENER')
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
      // console.log('TRIED TO REMOVE KEYDOWN EVEN HANDLER')
      console.log('UNMOUNT BOOKMARK PROMPT')
      document.removeEventListener('keydown', keydownPromptHandler)
    }
  }, [])

  useEffect(() => {
    if (hrefInputRef.current) {
      hrefInputRef.current.focus()
    }
    // if (!isShown) {
    //   setBookmark({ ...EMPTY_BOOKMARK })
    // }
    return () => {
      // console.log('RAN EFFECT CLEANUP FUNCTION')
      setBookmark({ ...EMPTY_BOOKMARK })
    }
  }, [isShown])

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
