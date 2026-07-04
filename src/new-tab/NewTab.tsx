import { PropsWithChildren, Ref, useEffect, useState } from 'react'
import { default as bookmarksJson } from '../../public/bookmarks-backup.json'
import BookmarkEntry from './BookmarkEntry'
import Search from './Search/Search'
import useBookmarkController from './useBookmarkController'
import BookmarkPrompt, { BookmarkPromptType } from './BookmarkPrompt'
import { Bookmark } from '../background'
import useBookmarkSorter from './useBookmarkSorter'
import ArrowDownCircle from '../components/Icons/ArrowDownCircle'
import Add from '../components/Icons/Add'
import AddCircle from '../components/Icons/AddCircle'
import ArrowUpCircle from '../components/Icons/ArrowUpCircle'
import PopOutMenu from './PopOutMenu'
import { useTrackFocus } from './useTrackFocus'
import IconButton from './IconButton'
import TopContextRow from './TopContextRow'
import { checkPromptOpen } from './util'
import CommandLine, { Command } from './CommandLine'
import RemoveCircle from '../components/Icons/RemoveCircle'
import Edit from '../components/Icons/Edit'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { motion } from 'motion/react'
import { useAtom } from 'jotai'
import {
  bookmarksAtom,
  useInitializeBookmarks,
} from './bookmark-controller/bookmarks-atom'
// import './NewTab.css'

type Bookmarks = typeof bookmarksJson

export const EMPTY_BOOKMARK: Bookmark = {
  id: 0,
  group: '',
  groupIndex: 0,
  col: 1,
  href: '',
  text: '',
}

const ButtonWithRef = ({
  ref,
  children,
}: { ref: Ref<HTMLButtonElement> } & PropsWithChildren) => (
  <Button
    ref={ref}
    variant="outline"
    onClick={() => {
      console.log('button')
    }}
  >
    {children}
  </Button>
)

const ShadMotionButton = motion.create(ButtonWithRef)

export default function NewTab() {
  const [showSearch, setShowSearch] = useState(true)
  const [showBkPrompt, setShowBkPrompt] = useState(false)
  const [showCommandLine, setShowCommandLine] = useState(false)
  const [selectedBk, setSelectedBk] = useState<Bookmark>({ ...EMPTY_BOOKMARK })
  const [bookmarkPromptType, setBookmarkPromptType] =
    useState<BookmarkPromptType>('new-bookmark')

  const controller = useBookmarkController()
  // const sorter = useBookmarkSorter(controller.bookmarks)
  const { focusPreviousElement } = useTrackFocus()

  const {
    bookmarks,
    recentLinks,
    addBookmark,
    removeBookmark,
    updateBookmark,
    updateGroupOrder,
    updateRecentLinks,
    addGroup,
    removeGroup,
    reset,
  } = controller

  // TESTING ATOMS START
  const [bks] = useAtom(bookmarksAtom)
  useInitializeBookmarks()
  useEffect(() => {
    console.log('BOOKMARKS FROM ATOM ----')
    console.log(bks)
  }, [bks])

  const sorter = useBookmarkSorter(bks)
  // TESTING ATOMS END

  function promptUpdateBookmark(bk: Bookmark) {
    setBookmarkPromptType('update-bookmark')
    setSelectedBk(bk)
    setShowBkPrompt(true)
  }

  function promptNewBookmark() {
    setBookmarkPromptType('new-bookmark')
    setSelectedBk({ ...EMPTY_BOOKMARK })
    setShowBkPrompt(true)
  }

  function promptNewGroup() {
    setBookmarkPromptType('new-group')
    setSelectedBk({ ...EMPTY_BOOKMARK })
    setShowBkPrompt(true)
  }

  function promptRemoveGroup() {
    setBookmarkPromptType('remove-group')
    setShowBkPrompt(true)
  }

  function promptUpdateGroup() {
    setBookmarkPromptType('update-group')
    setShowBkPrompt(true)
  }

  const commands: Command[] = [
    {
      action: () => {
        promptNewBookmark()
      },
      name: 'add bookmark',
      hotKey: 'ff',
    },
    // { action: removeBookmark, name: 'remove bookmark' },
    // looks like we'll handle both of these from search
    // { action: updateBookmark, name: 'update bookmark' },
    {
      action: () => {
        promptNewGroup()
      },
      name: 'add group',
      hotKey: 'jj',
    },
    {
      action: () => {
        promptRemoveGroup()
      },
      name: 'remove group',
      hotKey: 'dd',
    },
    {
      action: () => {
        promptUpdateGroup()
      },
      name: 'update group',
      hotKey: 'uu',
    },
    // TODO: rename group
  ]

  function isEmptyBookmark(bookmark: Bookmark) {
    return !Boolean(bookmark.href) && !Boolean(bookmark.text)
  }

  useEffect(() => {
    function keydownHandler(event: KeyboardEvent) {
      const isPromptOpen = checkPromptOpen()
      const { key, metaKey } = event
      if (key === 'k' && metaKey) {
        setShowSearch(true)
      }
      if (key === '.' && !isPromptOpen) {
        setShowCommandLine(true)
      }
    }
    document.addEventListener('keydown', keydownHandler)
  }, [])

  return (
    <div className="NewTab">
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Select>
        <SelectTrigger className="w-full max-w-48 bg-background">
          <SelectValue placeholder="holding the place" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectGroup className="bg-background">
            <SelectLabel>items</SelectLabel>
            <SelectItem className="bg-background" value="1">
              item 1
            </SelectItem>
            <SelectItem className="bg-background" value="2">
              item 2
            </SelectItem>
            <SelectItem className="bg-background" value="3">
              item 3
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>

      <ShadMotionButton whileTap={{ scale: '0.88' }}>
        motion button
      </ShadMotionButton>

      <div className="selected-bookmark" style={{ display: 'none' }}>
        {JSON.stringify(selectedBk)}
      </div>
      <TopContextRow>
        <button
          onClick={() => {
            reset()
            updateRecentLinks('', '', true)
          }}
        >
          reset
        </button>
        <button onClick={focusPreviousElement}>focus previous</button>
        <div>
          <button>mod</button> + <button>k</button> to search
        </div>
        <div>
          <button>.</button> for command line
        </div>
        <button
          onClick={() => {
            setBookmarkPromptType('new-bookmark')
            setSelectedBk({ ...EMPTY_BOOKMARK })
            setShowBkPrompt(true)
          }}
        >
          add bookmark
        </button>
        <button
          onClick={() => {
            setBookmarkPromptType('new-group')
            setSelectedBk({ ...EMPTY_BOOKMARK })
            setShowBkPrompt(true)
          }}
        >
          add group
        </button>
      </TopContextRow>

      {showSearch ? (
        <Search
          bookmarks={bks}
          recentLinks={recentLinks}
          updateRecentLinks={updateRecentLinks}
          showSearch={showSearch}
          setShowSearch={setShowSearch}
          promptUpdateBookmark={promptUpdateBookmark}
          setSelectedBk={setSelectedBk}
        />
      ) : null}

      {showBkPrompt ? (
        <BookmarkPrompt
          type={bookmarkPromptType}
          isShown={showBkPrompt}
          setIsShown={setShowBkPrompt}
          bookmark={selectedBk}
          setBookmark={setSelectedBk}
          {...controller}
          {...sorter}
        />
      ) : null}
      {showCommandLine ? (
        <CommandLine
          commands={commands}
          isShown={showCommandLine}
          setIsShown={setShowCommandLine}
        />
      ) : null}
      <div className="bookmark-groups">
        {sorter.sortedColumns.map((col, index) => (
          <div key={'col-' + index}>
            <div>
              {col.map((entry, i) => {
                const isFirst = i === 0
                const groupName = entry.group
                const previousGroupName = col.at(i - 1)?.group
                const sameAsLast = previousGroupName === groupName
                const checkEmptyGroup = () => {
                  const entriesInGroup = col.filter(
                    (bk) => bk.group === groupName,
                  )
                  const firstEntry = entriesInGroup[0]
                  return firstEntry.href === '' && entriesInGroup.length === 1
                }
                const isEmptyGroup = checkEmptyGroup()
                return (
                  <div key={`${groupName}-${index}-${i}`}>
                    {!sameAsLast || isFirst ? (
                      <div>
                        <div className="bookmark-group">
                          <h2>{groupName}</h2>
                          <PopOutMenu
                            focusOnMount={isEmptyGroup}
                            menuStyles={{
                              bottom: isFirst ? '-4.5rem' : '-3.15rem',
                              width: '8.5rem',
                            }}
                          >
                            <IconButton
                              icon={<Add />}
                              clickHandler={() => {
                                const holding = {
                                  ...entry,
                                  id: 0,
                                  text: '',
                                  href: '',
                                }
                                console.log('set selected', holding)
                                setSelectedBk(holding)
                                setBookmarkPromptType('new-bookmark')
                                setShowBkPrompt(true)
                              }}
                            >
                              add bookmark
                            </IconButton>
                            <IconButton
                              icon={<AddCircle />}
                              clickHandler={() => {
                                setBookmarkPromptType('new-group')
                                setShowBkPrompt(true)
                                setSelectedBk({
                                  ...EMPTY_BOOKMARK,
                                  col: entry.col,
                                })
                              }}
                            >
                              add group
                            </IconButton>
                            <IconButton
                              icon={<Edit />}
                              clickHandler={() => {
                                setSelectedBk({ ...entry })
                                promptUpdateGroup()
                              }}
                            >
                              update group
                            </IconButton>
                            <IconButton
                              icon={<RemoveCircle />}
                              clickHandler={() => {
                                setSelectedBk({
                                  ...EMPTY_BOOKMARK,
                                  col: entry.col,
                                  group: entry.group,
                                })
                                promptRemoveGroup()
                              }}
                            >
                              remove group
                            </IconButton>

                            <IconButton
                              icon={<ArrowDownCircle />}
                              clickHandler={() =>
                                updateGroupOrder(groupName, index + 1, 'lower')
                              }
                            >
                              move group down
                            </IconButton>
                            <IconButton
                              icon={<ArrowUpCircle />}
                              clickHandler={() =>
                                updateGroupOrder(groupName, index + 1, 'raise')
                              }
                            >
                              move group up
                            </IconButton>
                          </PopOutMenu>
                        </div>
                      </div>
                    ) : null}
                    {!isEmptyBookmark(entry) && (
                      <BookmarkEntry
                        bookmark={entry}
                        selectBookmark={setSelectedBk}
                        showBookmarkPrompt={setShowBkPrompt}
                        removeBookmark={removeBookmark}
                        setBookmarkPromptType={setBookmarkPromptType}
                        key={'bookmark-entry-' + i}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
