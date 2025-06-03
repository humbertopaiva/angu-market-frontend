import React from 'react'
import { useNavigate } from '@tanstack/react-router'
import { SignUpForm } from '../components/signup-form'
import { useAuthViewModel } from '../viewmodel/auth-viewmodel'
import { useAuthStore } from '../stores/auth-store'
import type { SignUpInput } from '@/types/graphql'

export function SignUpView() {
  const navigate = useNavigate()
  const authViewModel = useAuthViewModel()
  const { isLoading } = useAuthStore()

  const handleSignUp = async (data: SignUpInput) => {
    await authViewModel.signUp(data)
  }

  const handleBackToLogin = () => {
    navigate({ to: '/auth/login' })
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Angu Market</h1>
        <p className="text-gray-600">Junte-se à nossa comunidade</p>
      </div>

      <SignUpForm
        onSubmit={handleSignUp}
        isLoading={isLoading}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  )
}
