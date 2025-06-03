import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { LoginForm } from '../components/login-form'
import { useAuthViewModel } from '../viewmodel/auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import type { LoginInput } from '@/types/graphql'

export function LoginView() {
  const navigate = useNavigate()
  const authViewModel = useAuthViewModel()
  const { isLoading } = useAuthStore()

  const handleLogin = async (data: LoginInput) => {
    await authViewModel.login(data)
  }

  const handleForgotPassword = () => {
    navigate({ to: '/auth/forgot-password' })
  }

  const handleSignUp = () => {
    navigate({ to: '/auth/signup' })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">
          Conectando você aos melhores negócios locais
        </p>
      </div>

      <LoginForm
        onSubmit={handleLogin}
        isLoading={isLoading}
        onForgotPassword={handleForgotPassword}
        onSignUp={handleSignUp}
      />
    </div>
  )
}
