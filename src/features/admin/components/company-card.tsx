// src/features/admin/components/company-card.tsx - NOVO COMPONENTE
import React from 'react'
import {
  Building,
  Edit,
  FileText,
  Folder,
  Globe,
  Mail,
  MapPin,
  MoreHorizontal,
  Phone,
  Tags,
  Trash2,
  Users,
} from 'lucide-react'
import type { Company } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CompanyCardProps {
  company: Company
  onEdit?: (company: Company) => void
  onDelete?: (company: Company) => void
  onManageUsers?: (company: Company) => void
  onManageSegmentation?: (company: Company) => void
}

export function CompanyCard({
  company,
  onEdit,
  onDelete,
  onManageUsers,
  onManageSegmentation,
}: CompanyCardProps) {
  const getSegmentationInfo = () => {
    const result = {
      segment: null as any,
      category: null as any,
      subcategory: null as any,
      isComplete: false,
    }

    // Priorizar subcategoria (mais específica)
    if (company.subcategory) {
      result.subcategory = company.subcategory
      result.category = company.subcategory.category

      // Buscar segmento através da categoria da subcategoria
      if (company.subcategory.category.segments?.[0]) {
        result.segment = company.subcategory.category.segments[0]
      }
    }
    // Se não tem subcategoria, mas tem categoria
    else if (company.category) {
      result.category = company.category

      // Buscar segmento através da categoria
      if (company.category.segments?.[0]) {
        result.segment = company.category.segments[0]
      }
    }
    // Se só tem segmento
    else if (company.segment) {
      result.segment = company.segment
    }

    // Verificar se tem hierarquia completa
    result.isComplete = !!(
      result.segment &&
      result.category &&
      result.subcategory
    )

    return result
  }

  const segmentationInfo = getSegmentationInfo()
  const usersCount = company.users?.length || 0
  const adminsCount =
    company.users?.filter((user) =>
      user.userRoles?.some((ur) => ur.role.name === 'COMPANY_ADMIN'),
    ).length || 0

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg leading-tight">
                {company.name}
              </CardTitle>
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Building className="h-3 w-3" />/{company.slug}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    company.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {company.isActive ? 'Ativo' : 'Inativo'}
                </span>
                {segmentationInfo.isComplete && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    Categorizado
                  </span>
                )}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(company)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              {onManageSegmentation && (
                <DropdownMenuItem onClick={() => onManageSegmentation(company)}>
                  <Tags className="mr-2 h-4 w-4" />
                  Gerenciar Segmentação
                </DropdownMenuItem>
              )}
              {onManageUsers && (
                <DropdownMenuItem onClick={() => onManageUsers(company)}>
                  <Users className="mr-2 h-4 w-4" />
                  Gerenciar Usuários
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(company)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remover
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        <p className="text-sm text-gray-600 line-clamp-2">
          {company.description}
        </p>

        {/* Informações do Place */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="h-4 w-4" />
          <span>
            {company.place.name} - {company.place.city}, {company.place.state}
          </span>
        </div>

        {/* Hierarquia de Segmentação */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Categorização</h4>

          {segmentationInfo.isComplete ? (
            <div className="space-y-1">
              {/* Segmento */}
              {segmentationInfo.segment && (
                <div className="flex items-center gap-2 text-sm">
                  <Tags className="h-3 w-3 text-blue-600" />
                  <span className="text-gray-600">Segmento:</span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor:
                          segmentationInfo.segment.color || '#6B7280',
                      }}
                    />
                    <span className="font-medium">
                      {segmentationInfo.segment.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Categoria */}
              {segmentationInfo.category && (
                <div className="flex items-center gap-2 text-sm">
                  <Folder className="h-3 w-3 text-green-600" />
                  <span className="text-gray-600">Categoria:</span>
                  <div className="flex items-center gap-1">
                    <div
                      className="w-3 h-3 rounded"
                      style={{
                        backgroundColor:
                          segmentationInfo.category.color || '#22C55E',
                      }}
                    />
                    <span className="font-medium">
                      {segmentationInfo.category.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Subcategoria */}
              {segmentationInfo.subcategory && (
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-3 w-3 text-orange-600" />
                  <span className="text-gray-600">Subcategoria:</span>
                  <span className="font-medium">
                    {segmentationInfo.subcategory.name}
                  </span>
                </div>
              )}

              {/* Hierarquia Visual */}
              <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                <span className="font-medium">Hierarquia:</span>{' '}
                {segmentationInfo.segment?.name} →{' '}
                {segmentationInfo.category?.name} →{' '}
                {segmentationInfo.subcategory?.name}
              </div>
            </div>
          ) : (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Categorização incompleta
              {segmentationInfo.segment && (
                <div className="mt-1 text-xs">
                  Segmento: {segmentationInfo.segment.name}
                </div>
              )}
              {segmentationInfo.category && (
                <div className="text-xs">
                  Categoria: {segmentationInfo.category.name}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Informações de Contato */}
        <div className="space-y-1">
          {company.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="h-3 w-3" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="h-3 w-3" />
              <span>{company.email}</span>
            </div>
          )}
          {company.website && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Globe className="h-3 w-3" />
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Website
              </a>
            </div>
          )}
        </div>

        {/* Informações dos Usuários */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{usersCount} usuários</span>
            </div>
            {adminsCount > 0 && (
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  {adminsCount} admin{adminsCount > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="text-xs text-gray-500">
            {new Date(company.updatedAt).toLocaleDateString('pt-BR')}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
