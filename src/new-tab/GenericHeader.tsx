import { cn } from '@/lib/utils'
import { ClassValue } from 'clsx'
import { PropsWithChildren } from 'react'

export function GenericHeader({
  children,
  underline = true,
  classNames,
}: { underline?: boolean; classNames?: ClassValue } & PropsWithChildren) {
  return (
    <h2
      className={cn('text-primary text-lg font-bold mbe-2', classNames, {
        underline,
      })}
    >
      {children}
    </h2>
  )
}
