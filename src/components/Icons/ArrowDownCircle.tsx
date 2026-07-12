import { cn } from '@/lib/utils'

export default function ArrowDownCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('w-6')}
    >
      <circle cx="12" cy="12" r="10" className={cn('fill-primary')}></circle>
      <path
        className={cn('fill-background-high')}
        d="M11 14.59V7a1 1 0 0 1 2 0v7.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 1.4-1.42l2.3 2.3z"
      ></path>
    </svg>
  )
}
