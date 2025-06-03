import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from '@tanstack/react-router'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

interface ThemeProviderProps {
  children: ReactNode
}

export class ThemeService {
  getInitialTheme(): Theme {
    const savedTheme = localStorage.getItem('theme') as Theme | null

    if (savedTheme) {
      return savedTheme
    }

    // Verificar preferência do sistema
    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches
    return prefersDark ? 'dark' : 'light'
  }

  saveTheme(theme: Theme): void {
    localStorage.setItem('theme', theme)
  }

  applyTheme(theme: Theme): void {
    const html = document.documentElement

    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const themeService = new ThemeService()
  const [theme, setTheme] = useState<Theme>(themeService.getInitialTheme())

  // Atualizar o tema no DOM e salvar no localStorage
  useEffect(() => {
    themeService.applyTheme(theme)
    themeService.saveTheme(theme)
  }, [theme])

  // Função para alternar entre os temas
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  const value = {
    theme,
    toggleTheme,
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
