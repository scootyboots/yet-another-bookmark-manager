export type BookmarkEntryProps = {
  group: string
  href: string
  text: string
  afterContent?: React.ReactNode
}

export default function BookmarkEntry(props: BookmarkEntryProps) {
  return (
    <div className="BookmarkEntry">
      <a
        className="bookmark-link"
        href={props.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.text}
      </a>
      <div style={{ display: 'none' }}>{props.href}</div>
      {props.afterContent}
    </div>
  )
}
