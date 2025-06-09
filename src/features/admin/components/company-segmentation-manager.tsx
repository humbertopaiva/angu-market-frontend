// src/features/admin/components/company-segmentation-manager.tsx
import React, { useEffect, useState } from 'react'
import {
  Building,
  FileText,
  Folder,
  Loader2,
  MoreHorizontal,
  Save,
  Tags,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { CompaniesService } from '../services/companies-service'
import type { Category, Company, Segment, Subcategory } from '@/types/graphql'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CompanySegmentationManagerProps {
  company: Company
  isOpen: boolean
  onClose: () => void
  onCompanyUpdate?: (company: Company) => void
}

interface SegmentationData {
  segments: Array<Segment>
  categories: Array<Category>
  subcategories: Array<Subcategory>
}

export function CompanySegmentationManager({
  company,
  isOpen,
  onClose,
  onCompanyUpdate,
}: CompanySegmentationManagerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [segmentationData, setSegmentationData] = useState<SegmentationData>({
    segments: [],
    categories: [],
    subcategories: [],
  })
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>('')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('')
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>('')

  const companiesService = new CompaniesService()

  useEffect(() => {
    if (isOpen && company.placeId) {
      loadSegmentationData()
      initializeSelectedValues()
    }
  }, [isOpen, company])

  const loadSegmentationData = async () => {
    try {
      setIsLoading(true)
      const data = await companiesService.getSegmentationDataForPlace(
        Number(company.placeId),
      )
      // Map the fetched data to match the expected SegmentationData type
      setSegmentationData({
        segments: data.segments as Array<Segment>,
        categories: data.categories as Array<Category>,
        subcategories: data.subcategories as Array<Subcategory>,
      })
    } catch (error) {
      console.error('Error loading segmentation data:', error)
      toast.error('Erro ao carregar dados de segmentação')
    } finally {
      setIsLoading(false)
    }
  }

  const initializeSelectedValues = () => {
    // Identificar segmento atual através da categoria
    if (company.category?.segments?.[0]) {
      setSelectedSegmentId(company.category.segments[0].id)
    } else {
      setSelectedSegmentId('')
    }

    // Categoria atual
    if (company.categoryId) {
      setSelectedCategoryId(company.categoryId.toString())
    } else {
      setSelectedCategoryId('')
    }

    // Subcategoria atual
    if (company.subcategoryId) {
      setSelectedSubcategoryId(company.subcategoryId.toString())
    } else {
      setSelectedSubcategoryId('')
    }
  }

  // Filtrar categorias baseado no segmento selecionado
  const availableCategories = React.useMemo(() => {
    if (!selectedSegmentId) return segmentationData.categories

    return segmentationData.categories.filter((category) =>
      category.segments?.some((segment) => segment.id === selectedSegmentId),
    )
  }, [segmentationData.categories, selectedSegmentId])

  // Filtrar subcategorias baseado na categoria selecionada
  const availableSubcategories = React.useMemo(() => {
    if (!selectedCategoryId) return []

    return segmentationData.subcategories.filter(
      (subcategory) => subcategory.categoryId === Number(selectedCategoryId),
    )
  }, [segmentationData.subcategories, selectedCategoryId])

  // Resetar seleções dependentes quando uma superior muda
  useEffect(() => {
    if (selectedSegmentId) {
      // Se mudou o segmento, verificar se a categoria ainda é válida
      const categoryStillValid = availableCategories.some(
        (cat) => cat.id === selectedCategoryId,
      )
      if (!categoryStillValid) {
        setSelectedCategoryId('')
        setSelectedSubcategoryId('')
      }
    }
  }, [selectedSegmentId, availableCategories, selectedCategoryId])

  useEffect(() => {
    if (selectedCategoryId) {
      // Se mudou a categoria, verificar se a subcategoria ainda é válida
      const subcategoryStillValid = availableSubcategories.some(
        (sub) => sub.id === selectedSubcategoryId,
      )
      if (!subcategoryStillValid) {
        setSelectedSubcategoryId('')
      }
    } else {
      setSelectedSubcategoryId('')
    }
  }, [selectedCategoryId, availableSubcategories, selectedSubcategoryId])

  const handleSave = async () => {
    try {
      setIsLoading(true)

      let updatedCompany: Company

      if (selectedSubcategoryId) {
        // Se tem subcategoria, atrelar à subcategoria
        updatedCompany = await companiesService.assignCompanyToSubcategory(
          Number(company.id),
          Number(selectedSubcategoryId),
        )
      } else if (selectedCategoryId) {
        // Se tem apenas categoria, atrelar à categoria
        updatedCompany = await companiesService.assignCompanyToCategory(
          Number(company.id),
          Number(selectedCategoryId),
        )
      } else if (selectedSegmentId) {
        // Se tem apenas segmento, atrelar ao segmento
        updatedCompany = await companiesService.assignCompanyToSegment(
          Number(company.id),
          Number(selectedSegmentId),
        )
      } else {
        // Se não selecionou nada, remover segmentação
        updatedCompany = await companiesService.removeCompanyFromSegmentation(
          Number(company.id),
        )
      }

      toast.success('Segmentação atualizada com sucesso!')

      if (onCompanyUpdate) {
        onCompanyUpdate(updatedCompany)
      }

      onClose()
    } catch (error) {
      console.error('Error updating company segmentation:', error)
      toast.error('Erro ao atualizar segmentação da empresa')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveSegmentation = async () => {
    if (
      !window.confirm(
        'Tem certeza que deseja remover toda a segmentação desta empresa?',
      )
    ) {
      return
    }

    try {
      setIsLoading(true)
      const updatedCompany =
        await companiesService.removeCompanyFromSegmentation(Number(company.id))

      toast.success('Segmentação removida com sucesso!')

      if (onCompanyUpdate) {
        onCompanyUpdate(updatedCompany)
      }

      onClose()
    } catch (error) {
      console.error('Error removing company segmentation:', error)
      toast.error('Erro ao remover segmentação da empresa')
    } finally {
      setIsLoading(false)
    }
  }

  const getCurrentSegmentation = () => {
    const result = {
      segment: null as any,
      category: null as any,
      subcategory: null as any,
    }

    if (company.subcategory) {
      result.subcategory = company.subcategory
      result.category = company.subcategory.category

      // Buscar segmento através da categoria
      if (company.subcategory.category.segments?.[0]) {
        result.segment = company.subcategory.category.segments[0]
      }
    } else if (company.category) {
      result.category = company.category

      // Buscar segmento através da categoria
      if (company.category.segments?.[0]) {
        result.segment = company.category.segments[0]
      }
    }

    return result
  }

  const currentSegmentation = getCurrentSegmentation()
  const hasCurrentSegmentation = !!(
    currentSegmentation.segment ||
    currentSegmentation.category ||
    currentSegmentation.subcategory
  )

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Gerenciar Segmentação - {company.name}
          </DialogTitle>
          <DialogDescription>
            Configure a segmentação desta empresa selecionando segmento,
            categoria e subcategoria.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Segmentação Atual */}
          {hasCurrentSegmentation && (
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-sm text-blue-800">
                  Segmentação Atual
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {currentSegmentation.segment && (
                  <div className="flex items-center gap-2 text-sm">
                    <Tags className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Segmento:</span>
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{
                        backgroundColor:
                          currentSegmentation.segment.color || '#6B7280',
                      }}
                    >
                      {currentSegmentation.segment.name}
                    </span>
                  </div>
                )}
                {currentSegmentation.category && (
                  <div className="flex items-center gap-2 text-sm">
                    <Folder className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Categoria:</span>
                    <span
                      className="px-2 py-1 rounded text-white text-xs"
                      style={{
                        backgroundColor:
                          currentSegmentation.category.color || '#22C55E',
                      }}
                    >
                      {currentSegmentation.category.name}
                    </span>
                  </div>
                )}
                {currentSegmentation.subcategory && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">Subcategoria:</span>
                    <span className="px-2 py-1 rounded bg-orange-100 text-orange-800 text-xs">
                      {currentSegmentation.subcategory.name}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Formulário de Nova Segmentação */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              {hasCurrentSegmentation
                ? 'Alterar Segmentação'
                : 'Definir Segmentação'}
            </h3>

            {/* Segmento */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Segmento
              </label>
              <Select
                value={selectedSegmentId}
                onValueChange={setSelectedSegmentId}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um segmento (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem segmento</SelectItem>
                  {segmentationData.segments
                    .filter((segment) => segment.isActive)
                    .map((segment) => (
                      <SelectItem key={segment.id} value={segment.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: segment.color || '#6B7280',
                            }}
                          />
                          {segment.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Categoria
              </label>
              <Select
                value={selectedCategoryId}
                onValueChange={setSelectedCategoryId}
                disabled={isLoading || availableCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      availableCategories.length === 0
                        ? 'Nenhuma categoria disponível'
                        : 'Selecione uma categoria (opcional)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem categoria</SelectItem>
                  {availableCategories
                    .filter((category) => category.isActive)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{
                              backgroundColor: category.color || '#22C55E',
                            }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedSegmentId && availableCategories.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhuma categoria encontrada para este segmento.
                </p>
              )}
            </div>

            {/* Subcategoria */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Subcategoria
              </label>
              <Select
                value={selectedSubcategoryId}
                onValueChange={setSelectedSubcategoryId}
                disabled={
                  isLoading ||
                  !selectedCategoryId ||
                  availableSubcategories.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedCategoryId
                        ? 'Selecione uma categoria primeiro'
                        : availableSubcategories.length === 0
                          ? 'Nenhuma subcategoria disponível'
                          : 'Selecione uma subcategoria (opcional)'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem subcategoria</SelectItem>
                  {availableSubcategories
                    .filter((subcategory) => subcategory.isActive)
                    .map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              {selectedCategoryId && availableSubcategories.length === 0 && (
                <p className="text-xs text-amber-600">
                  Nenhuma subcategoria encontrada para esta categoria.
                </p>
              )}
            </div>

            {/* Preview da Seleção */}
            {(selectedSegmentId ||
              selectedCategoryId ||
              selectedSubcategoryId) && (
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-sm text-green-800">
                    Nova Segmentação (Preview)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {selectedSegmentId && (
                    <div className="flex items-center gap-2 text-sm">
                      <Tags className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Segmento:</span>
                      <span>
                        {
                          segmentationData.segments.find(
                            (s) => s.id === selectedSegmentId,
                          )?.name
                        }
                      </span>
                    </div>
                  )}
                  {selectedCategoryId && (
                    <div className="flex items-center gap-2 text-sm">
                      <Folder className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Categoria:</span>
                      <span>
                        {
                          availableCategories.find(
                            (c) => c.id === selectedCategoryId,
                          )?.name
                        }
                      </span>
                    </div>
                  )}
                  {selectedSubcategoryId && (
                    <div className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-green-600" />
                      <span className="font-medium">Subcategoria:</span>
                      <span>
                        {
                          availableSubcategories.find(
                            (s) => s.id === selectedSubcategoryId,
                          )?.name
                        }
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div>
              {hasCurrentSegmentation && (
                <Button
                  variant="outline"
                  onClick={handleRemoveSegmentation}
                  disabled={isLoading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="mr-2 h-4 w-4" />
                  Remover Segmentação
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Segmentação
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
