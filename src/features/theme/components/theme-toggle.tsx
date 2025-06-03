import React from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useTheme } from '../context/theme.context'

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="py-3 px-5 rounded-xs focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-purple-500/8"
      aria-label={
        theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'
      }
    >
      {theme === 'dark' ? (
        <FiSun className="w-5 h-5 text-white" />
      ) : (
        <FiMoon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  )
}
