import { cn } from '@/lib/utils'

export default function Dot() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('w-6')}
    >
      <circle className={cn('fill-primary')} cx="12" cy="12" r="2" />
    </svg>
  )
}
