import { PropsWithChildren } from 'react'

export default function TopContextRow({ children }: PropsWithChildren) {
  return (
    <div
      className="top-row"
      style={{ display: 'flex', flexWrap: 'nowrap', gap: '0.4rem' }}
    >
      {children}
    </div>
  )
}
