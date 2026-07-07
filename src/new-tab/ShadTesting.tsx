import { PropsWithChildren, Ref } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
} from '@/components/ui/select'
import { motion } from 'motion/react'

export function ShadTesting() {
  const ButtonWithRef = ({
    ref,
    children,
  }: { ref: Ref<HTMLButtonElement> } & PropsWithChildren) => (
    <Button
      ref={ref}
      variant="outline"
      onClick={() => {
        console.log('button')
      }}
    >
      {children}
    </Button>
  )

  const ShadMotionButton = motion.create(ButtonWithRef)
  return (
    <>
      <h1 className="text-3xl font-bold underline">Hello world!</h1>
      <Button
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="ghost"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Button
        variant="secondary"
        onClick={() => {
          console.log('button')
        }}
      >
        shad button
      </Button>
      <Select>
        <SelectTrigger className="w-full max-w-48 bg-background">
          <SelectValue placeholder="holding the place" />
        </SelectTrigger>
        <SelectContent className="bg-background">
          <SelectGroup className="bg-background">
            <SelectLabel>items</SelectLabel>
            <SelectItem className="bg-background" value="1">
              item 1
            </SelectItem>
            <SelectItem className="bg-background" value="2">
              item 2
            </SelectItem>
            <SelectItem className="bg-background" value="3">
              item 3
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <ShadMotionButton whileTap={{ scale: '0.88' }}>
        motion button
      </ShadMotionButton>
    </>
  )
}
