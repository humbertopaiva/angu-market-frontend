import { createFileRoute } from '@tanstack/react-router'
import { UsersView } from '@/features/admin/view/users-view'

export const Route = createFileRoute('/admin/users')({
  component: UsersView,
})
