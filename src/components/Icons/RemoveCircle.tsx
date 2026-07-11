import { cn } from '@/lib/utils'

export default function RemoveCircle() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn('w-6')}
    >
      <circle cx="12" cy="12" r="10" className={cn('fill-primary')}></circle>
      <rect
        width="12"
        height="2"
        x="6"
        y="11"
        className={cn('fill-primary-low')}
        rx="1"
      ></rect>
    </svg>
  )
}
