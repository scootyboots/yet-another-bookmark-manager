import { cn } from '@/lib/utils'

export default function AddCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('w-6')}
    >
      <circle cx="12" cy="12" r="10" className={cn('fill-primary')}></circle>
      <path
        className={cn('fill-background-high')}
        d="M13 11h4a1 1 0 0 1 0 2h-4v4a1 1 0 0 1-2 0v-4H7a1 1 0 0 1 0-2h4V7a1 1 0 0 1 2 0v4z"
      ></path>
    </svg>
  )
}
