'use client';

import { useTheme } from 'next-themes'
import { Button } from './ui/button'
import { Moon, Sun } from 'lucide-react'

export default function ModeToggle() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  return (
    <Button
      variant={"outline"}
      size={"icon"}
      onClick={toggleTheme}
    >
      {theme === 'light' ? <Sun /> : <Moon />}
    </Button>
  )
}
