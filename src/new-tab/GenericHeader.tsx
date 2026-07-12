import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

export function GenericHeader({ children }: PropsWithChildren) {
  return (
    <h2 className={cn('text-primary text-lg underline font-bold mbe-2')}>
      {children}
    </h2>
  )
}
