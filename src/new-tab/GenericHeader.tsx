import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

export function GenericHeader({
  children,
  underline = true,
}: { underline?: boolean } & PropsWithChildren) {
  return (
    <h2
      className={cn('text-primary text-lg font-bold mbe-2', {
        underline,
      })}
    >
      {children}
    </h2>
  )
}
