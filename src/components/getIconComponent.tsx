import {
  Cat,
  Squirrel,
  Dog,
  Rabbit,
  Turtle,
  Bird,
  Baby,
  Ghost,
  Fish,
  Rat,
} from 'lucide-react'
import React from 'react'
import { UserIcon } from '../type'

const iconMap: Record<UserIcon, React.ElementType> = {
  Cat: Cat,
  Squirrel: Squirrel,
  Dog: Dog,
  Rabbit: Rabbit,
  Turtle: Turtle,
  Bird: Bird,
  Baby: Baby,
  Ghost: Ghost,
  Fish: Fish,
  Rat: Rat,
}

// Optional: Create a helper function that returns the component for an icon name.
export const getIconComponent = (iconName: UserIcon): React.ElementType => {
  return iconMap[iconName]
}
