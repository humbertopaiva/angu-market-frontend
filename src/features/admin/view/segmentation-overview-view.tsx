// src/features/admin/view/segmentation-overview-view.tsx
import React, { useEffect } from 'react'
import {
  Building,
  FileText,
  Folder,
  Loader2,
  Plus,
  Tags,
  TrendingUp,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { useSegmentsViewModel } from '../viewmodel/segments-viewmodel'
import { useCategoriesViewModel } from '../viewmodel/categories-viewmodel'
import { useSubcategoriesViewModel } from '../viewmodel/subcategories-viewmodel'
import { useCompaniesViewModel } from '../viewmodel/companies-viewmodel'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/features/auth/stores/auth-store'
import { isPlaceAdmin, isSuperAdmin } from '@/utils/role-helpers'

export function SegmentationOverviewView() {
  const navigate = useNavigate()
  const { viewModel: segmentsViewModel, segments } = useSegmentsViewModel()
  const { viewModel: categoriesViewModel, categories } =
    useCategoriesViewModel()
  const { viewModel: subcategoriesViewModel, subcategories } =
    useSubcategoriesViewModel()
  const { viewModel: companiesViewModel, companies } = useCompaniesViewModel()
  const { user } = useAuthStore()

  useEffect(() => {
    if (isPlaceAdmin(user) && user?.placeId) {
      // Place Admin: carregar apenas dados do seu place
      segmentsViewModel.loadSegmentsByPlace(user.placeId)
      categoriesViewModel.loadCategoriesByPlace(user.placeId)
      subcategoriesViewModel.loadSubcategoriesByPlace(user.placeId)
      companiesViewModel.loadCompaniesByPlace(user.placeId)
    } else {
      // Super Admin: carregar todos os dados
      segmentsViewModel.loadSegments()
      categoriesViewModel.loadCategories()
      subcategoriesViewModel.loadSubcategories()
      companiesViewModel.loadCompanies()
    }
  }, [user])

  // Verificar se usuário pode acessar segmentação
  if (!user || (!isSuperAdmin(user) && !isPlaceAdmin(user))) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Tags className="h-12 w-12 text-gray-400 mb-4 mx-auto" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Acesso Negado
          </h3>
          <p className="text-gray-600">
            Você não tem permissão para acessar a segmentação.
          </p>
        </div>
      </div>
    )
  }

  const activeSegments = segments.filter((s) => s.isActive).length
  const activeCategories = categories.filter((c) => c.isActive).length
  const activeSubcategories = subcategories.filter((s) => s.isActive).length
  const categorizedCompanies = companies.filter(
    (c) => c.categoryId || c.subcategoryId,
  ).length

  const stats = [
    {
      title: 'Segmentos',
      value: segments.length,
      description: `${activeSegments} ativos`,
      icon: Tags,
      color: 'blue',
      href: '/admin/segments',
    },
    {
      title: 'Categorias',
      value: categories.length,
      description: `${activeCategories} ativas`,
      icon: Folder,
      color: 'green',
      href: '/admin/categories',
    },
    {
      title: 'Subcategorias',
      value: subcategories.length,
      description: `${activeSubcategories} ativas`,
      icon: FileText,
      color: 'orange',
      href: '/admin/subcategories',
    },
    {
      title: 'Empresas Categorizadas',
      value: categorizedCompanies,
      description: `${Math.round((categorizedCompanies / (companies.length || 1)) * 100)}% do total`,
      icon: Building,
      color: 'purple',
      href: '/admin/companies',
    },
  ]

  // Agrupar categorias por segmento
  const segmentData = segments.map((segment) => {
    const segmentCategories = categories.filter((cat) =>
      cat.segments?.some((seg) => seg.id === segment.id),
    )
    const segmentSubcategories = subcategories.filter((sub) =>
      segmentCategories.some((cat) => cat.id === sub.category.id),
    )
    const segmentCompanies = companies.filter(
      (comp) =>
        segmentCategories.some((cat) => cat.id === String(comp.categoryId)) ||
        segmentSubcategories.some(
          (sub) => sub.id === String(comp.subcategoryId),
        ),
    )

    return {
      ...segment,
      categoriesCount: segmentCategories.length,
      subcategoriesCount: segmentSubcategories.length,
      companiesCount: segmentCompanies.length,
    }
  })

  const handleNavigate = (href: string) => {
    navigate({ to: href as any })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Visão Geral da Segmentação
        </h1>
        <p className="text-gray-600">
          {isPlaceAdmin(user)
            ? `Estrutura de categorização do place: ${user.place?.name || 'Seu Place'}`
            : 'Overview da estrutura de categorização do sistema'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.title}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleNavigate(stat.href)}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 text-${stat.color}-600`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Estrutura Hierárquica */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Ações Rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Ações Rápidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/admin/segments')}
              >
                <Tags className="mr-2 h-4 w-4" />
                Criar Segmento
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/admin/categories')}
              >
                <Folder className="mr-2 h-4 w-4" />
                Criar Categoria
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => handleNavigate('/admin/subcategories')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Criar Subcategoria
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estatísticas Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Estatísticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Cobertura de Categorização
                </span>
                <span className="font-semibold">
                  {Math.round(
                    (categorizedCompanies / (companies.length || 1)) * 100,
                  )}
                  %
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Média de Categorias por Segmento
                </span>
                <span className="font-semibold">
                  {segments.length > 0
                    ? Math.round(categories.length / segments.length)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Média de Subcategorias por Categoria
                </span>
                <span className="font-semibold">
                  {categories.length > 0
                    ? Math.round(subcategories.length / categories.length)
                    : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">
                  Empresas Não Categorizadas
                </span>
                <span className="font-semibold text-amber-600">
                  {companies.length - categorizedCompanies}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Segmentos com Detalhes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Tags className="h-5 w-5" />
              Segmentos Detalhados
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleNavigate('/admin/segments')}
            >
              Ver Todos
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {segmentData.length === 0 ? (
            <div className="text-center py-8">
              <Tags className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhum segmento cadastrado
              </h3>
              <p className="text-gray-600 mb-4">
                Comece criando segmentos para organizar suas categorias.
              </p>
              <Button onClick={() => handleNavigate('/admin/segments')}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro segmento
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {segmentData.slice(0, 5).map((segment) => (
                <div
                  key={segment.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: segment.color || '#6B7280' }}
                    />
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {segment.name}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-1">
                        {segment.description}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {segment.categoriesCount}
                      </div>
                      <div>Categorias</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {segment.subcategoriesCount}
                      </div>
                      <div>Subcategorias</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-gray-900">
                        {segment.companiesCount}
                      </div>
                      <div>Empresas</div>
                    </div>
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        segment.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {segment.isActive ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                </div>
              ))}
              {segmentData.length > 5 && (
                <div className="text-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleNavigate('/admin/segments')}
                  >
                    Ver mais {segmentData.length - 5} segmentos
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Categorias Recentes */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Categorias Recentes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('/admin/categories')}
              >
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categories.length === 0 ? (
              <div className="text-center py-6">
                <Folder className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhuma categoria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {categories
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 3)
                  .map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{
                            backgroundColor: category.color || '#22C55E',
                          }}
                        />
                        <span className="text-sm font-medium">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{category.subcategories?.length || 0} subs</span>
                        <span>•</span>
                        <span>{category.companies?.length || 0} empresas</span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Subcategorias Recentes
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleNavigate('/admin/subcategories')}
              >
                Ver Todas
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subcategories.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Nenhuma subcategoria</p>
              </div>
            ) : (
              <div className="space-y-3">
                {subcategories
                  .sort(
                    (a, b) =>
                      new Date(b.createdAt).getTime() -
                      new Date(a.createdAt).getTime(),
                  )
                  .slice(0, 3)
                  .map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between"
                    >
                      <div>
                        <div className="text-sm font-medium">
                          {subcategory.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {subcategory.category.name}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {subcategory.companies?.length || 0} empresas
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
