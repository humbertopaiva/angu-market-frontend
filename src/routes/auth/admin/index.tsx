import { createFileRoute } from '@tanstack/react-router'
import { AdminOverviewView } from '@/features/admin/view/admin-dashboard-view'

// src/routes/admin/places.tsx
import { PlacesView } from '@/features/admin/view/places-view'

export const Route = createFileRoute('/admin/')({
  component: AdminOverviewView,
})

export const Route = createFileRoute('/admin/places')({
  component: PlacesView,
})
