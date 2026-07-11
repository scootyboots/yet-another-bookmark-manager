import { cn } from '@/lib/utils'

export function GenericHeader({ text }: { text: string }) {
  return (
    <h2 className={cn('text-primary text-lg underline font-bold mbe-2')}>
      {text}
    </h2>
  )
}
