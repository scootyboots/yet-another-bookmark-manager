import { cn } from '@/lib/utils'

export function GenericHeader({ text }: { text: string }) {
  return (
    <h2 className={cn('text-primary text-lg underline font-bold')}>{text}</h2>
  )
}
