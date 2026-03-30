import { Bookmark } from '../background'

export default function SelectedBookmark({
  selectedBookmark,
  render,
}: {
  selectedBookmark: Bookmark
  render: boolean
}) {
  return render ? (
    <div className="selected-bookmark" style={{ display: 'none' }}>
      {JSON.stringify(selectedBookmark)}
    </div>
  ) : null
}
