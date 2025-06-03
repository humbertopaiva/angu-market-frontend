import React from 'react'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

interface MoviePaginationProps {
  currentPage: number
  totalPages: number
  loading: boolean
  onPageChange: (page: number) => void
}

export const MoviePagination: React.FC<MoviePaginationProps> = ({
  currentPage,
  totalPages,
  loading,
  onPageChange,
}) => {
  // Função para gerar os itens da paginação
  const generatePaginationItems = () => {
    const items = []
    const maxVisible = 5 // Número máximo de páginas visíveis

    // Sempre mostrar a primeira página
    items.push(
      <PaginationItem key="page-1">
        <PaginationLink
          href="#"
          isActive={currentPage === 1}
          onClick={(e) => {
            e.preventDefault()
            onPageChange(1)
          }}
        >
          1
        </PaginationLink>
      </PaginationItem>,
    )

    // Calcular intervalo a mostrar
    let startPage = Math.max(2, currentPage - Math.floor(maxVisible / 2))
    const endPage = Math.min(totalPages - 1, startPage + maxVisible - 3)

    if (endPage - startPage < maxVisible - 3) {
      startPage = Math.max(2, endPage - (maxVisible - 3) + 1)
    }

    // Adicionar elipses após a página 1 se necessário
    if (startPage > 2) {
      items.push(
        <PaginationItem key="ellipsis-1">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Adicionar páginas do meio
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={`page-${i}`}>
          <PaginationLink
            href="#"
            isActive={currentPage === i}
            onClick={(e) => {
              e.preventDefault()
              onPageChange(i)
            }}
          >
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    // Adicionar elipses antes da última página se necessário
    if (endPage < totalPages - 1) {
      items.push(
        <PaginationItem key="ellipsis-2">
          <PaginationEllipsis />
        </PaginationItem>,
      )
    }

    // Sempre mostrar a última página se tivermos mais que uma página
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={`page-${totalPages}`}>
          <PaginationLink
            href="#"
            isActive={currentPage === totalPages}
            onClick={(e) => {
              e.preventDefault()
              onPageChange(totalPages)
            }}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    return items
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className="my-8">
      <PaginationContent className="gap-2">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (!loading && currentPage > 1) onPageChange(currentPage - 1)
            }}
            className={
              loading || currentPage <= 1
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>

        {generatePaginationItems()}

        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault()
              if (!loading && currentPage < totalPages)
                onPageChange(currentPage + 1)
            }}
            className={
              loading || currentPage >= totalPages
                ? 'pointer-events-none opacity-50'
                : ''
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
