import { cn } from '@/lib/utils'

export default function DotsHorizontal() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="">
      <path
        className={cn('fill-primary-low')}
        fill-rule="evenodd"
        d="M5 14a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm7 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"
      ></path>
    </svg>
  )
}
