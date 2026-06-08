import { proposalAPI } from '../../features/proposal/proposal-api'
import ProposalItem from './components/ProposalItem'
import { Skeleton } from '../../components/skeletons/Skeleton'
import { ToastContainer } from 'react-toastify'
import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { translateStatus } from '../../helpers/translateStatus'
import { areaAPI } from '../../features/area/area-api'
import { categoryAPI } from '../../features/category/category-api'
import DropdownSelect from '../../components/DropdownSelect'

type PageSizeSelection = '50' | '100' | '200' | 'more'
type MoreLimitSelection = 'all' | 'custom' | null
type PageItem = number | 'ellipsis'

const STATUS_OPTIONS = [
  'DEFINE_CHAMPION',
  'UNDER_VALIDATION',
  'TO_IMPLEMENT',
  'IMPLEMENTATION',
  'REJECTED',
  'NOT_VIABLE',
  'IMPLEMENTED',
] as const

const parseOptionalNumber = (value: string) => {
  const trimmedValue = value.trim()

  if (!trimmedValue) {
    return undefined
  }

  const parsedValue = Number(trimmedValue)
  return Number.isFinite(parsedValue) ? parsedValue : undefined
}

const getPageItems = (currentPage: number, totalPages: number): PageItem[] => {
  if (totalPages <= 0) {
    return []
  }

  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, totalPages, currentPage])

  if (currentPage > 1) {
    pages.add(currentPage - 1)
  }

  if (currentPage < totalPages) {
    pages.add(currentPage + 1)
  }

  if (currentPage <= 3) {
    pages.add(2)
    pages.add(3)
    pages.add(4)
  }

  if (currentPage >= totalPages - 2) {
    pages.add(totalPages - 1)
    pages.add(totalPages - 2)
    pages.add(totalPages - 3)
  }

  const sortedPages = Array.from(pages)
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((left, right) => left - right)

  const items: PageItem[] = []

  sortedPages.forEach((page, index) => {
    if (index > 0 && page - sortedPages[index - 1] > 1) {
      items.push('ellipsis')
    }

    items.push(page)
  })

  return items
}

const SuggestionList: React.FC = () => {
  const { data: areasList } = areaAPI.useGetAreasQuery()
  const { data: categoryList } = categoryAPI.useGetCategoriesQuery()

  const [pageSizeSelection, setPageSizeSelection] = useState<PageSizeSelection>('50')
  const [moreLimitSelection, setMoreLimitSelection] = useState<MoreLimitSelection>(null)
  const [isMoreOptionsOpen, setIsMoreOptionsOpen] = useState(false)
  const [customLimitInput, setCustomLimitInput] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [resolvedLimit, setResolvedLimit] = useState(50)
  const [filterIdInput, setFilterIdInput] = useState('')
  const [filterReInput, setFilterReInput] = useState('')
  const [filterEmployeeNameInput, setFilterEmployeeNameInput] = useState('')
  const [filterDescriptionInput, setFilterDescriptionInput] = useState('')
  const [filterCreatedAtInput, setFilterCreatedAtInput] = useState('')
  const [filterStatusInput, setFilterStatusInput] = useState('')
  const [filterAreaInput, setFilterAreaInput] = useState('')
  const [filterCategoryInput, setFilterCategoryInput] = useState('')
  const presetLimit =
    pageSizeSelection === '50'
      ? 50
      : pageSizeSelection === '100'
        ? 100
        : pageSizeSelection === '200'
          ? 200
          : 50
  const customLimitValue = Number(customLimitInput)
  const customLimit =
    Number.isInteger(customLimitValue) && customLimitValue > 0 ? customLimitValue : 50
  const offset = (currentPage - 1) * resolvedLimit
  const activeFilters = useMemo(() => {
    const employeeName = filterEmployeeNameInput.trim()
    const description = filterDescriptionInput.trim()

    return {
      id: parseOptionalNumber(filterIdInput),
      re: parseOptionalNumber(filterReInput),
      employeeName: employeeName || undefined,
      description: description || undefined,
      createdAt: filterCreatedAtInput || undefined,
      status: filterStatusInput || undefined,
      areaId: parseOptionalNumber(filterAreaInput),
      categoryId: parseOptionalNumber(filterCategoryInput),
    }
  }, [
    filterCreatedAtInput,
    filterDescriptionInput,
    filterEmployeeNameInput,
    filterIdInput,
    filterAreaInput,
    filterCategoryInput,
    filterReInput,
    filterStatusInput,
  ])
  const hasActiveFilters =
    activeFilters.id !== undefined ||
    activeFilters.re !== undefined ||
    activeFilters.employeeName !== undefined ||
    activeFilters.description !== undefined ||
    activeFilters.createdAt !== undefined ||
    activeFilters.status !== undefined ||
    activeFilters.areaId !== undefined ||
    activeFilters.categoryId !== undefined
  const { data: proposalsResponse, isLoading } = proposalAPI.useGetProposalsDetailedQuery({
    limit: resolvedLimit,
    offset,
    ...activeFilters,
  })
  const proposalsData = proposalsResponse?.proposals ?? []
  const totalCount = proposalsResponse?.totalCount ?? 0
  const totalPages = resolvedLimit > 0 ? Math.ceil(totalCount / resolvedLimit) : 0
  const hasNextPage = totalPages > 0 && currentPage < totalPages
  const previousPage = currentPage > 1 ? currentPage - 1 : null
  const nextPage = hasNextPage ? currentPage + 1 : null
  const visiblePages = useMemo(
    () => getPageItems(currentPage, totalPages),
    [currentPage, totalPages],
  )

  useEffect(() => {
    if (pageSizeSelection === 'more') {
      if (moreLimitSelection === 'all') {
        setResolvedLimit(proposalsResponse?.totalCount ?? 50)
      } else if (moreLimitSelection === 'custom') {
        setResolvedLimit(customLimit)
      }
      return
    }

    setResolvedLimit(presetLimit)
  }, [
    customLimit,
    moreLimitSelection,
    pageSizeSelection,
    presetLimit,
    proposalsResponse?.totalCount,
  ])

  useEffect(() => {
    if (totalPages === 0) {
      if (currentPage !== 1) {
        setCurrentPage(1)
      }
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    setCurrentPage(1)
  }, [pageSizeSelection, moreLimitSelection])

  useEffect(() => {
    setCurrentPage(1)
  }, [
    activeFilters.createdAt,
    activeFilters.description,
    activeFilters.employeeName,
    activeFilters.id,
    activeFilters.areaId,
    activeFilters.categoryId,
    activeFilters.re,
    activeFilters.status,
  ])

  useEffect(() => {
    if (pageSizeSelection !== 'more') {
      setMoreLimitSelection(null)
      setIsMoreOptionsOpen(false)
      setCustomLimitInput('')
    }
  }, [pageSizeSelection])

  const handlePageSizeChange = (value: PageSizeSelection) => {
    if (value === 'more') {
      setPageSizeSelection('more')
      setIsMoreOptionsOpen(true)
      setMoreLimitSelection(null)
      return
    }

    setPageSizeSelection(value)
    setMoreLimitSelection(null)
    setIsMoreOptionsOpen(false)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleCustomLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setCustomLimitInput(event.target.value)
  }

  const handleClearFilters = () => {
    setFilterIdInput('')
    setFilterReInput('')
    setFilterEmployeeNameInput('')
    setFilterDescriptionInput('')
    setFilterCreatedAtInput('')
    setFilterStatusInput('')
    setFilterAreaInput('')
    setFilterCategoryInput('')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
          <Skeleton className="mx-4 my-3 h-8 w-56 sm:my-4 sm:h-9" />
          <div className="mx-3 rounded-lg border border-gray-300 p-4 sm:mx-4">
            <div className="hidden grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] rounded-t-lg bg-gray-300 px-4 py-2 md:grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-4 w-16 rounded-md bg-gray-200/70" />
              ))}
            </div>
            <div className="space-y-3 py-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 md:grid-cols-[56px_2fr_2fr_1fr_1fr_1fr]"
                >
                  {Array.from({ length: 6 }).map((_, cellIndex) => (
                    <Skeleton key={cellIndex} className="h-4 w-full rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <ToastContainer />
      <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-xl font-semibold sm:my-4 sm:text-2xl">
          Lista de Propostas
        </div>
        <div className="mx-4 mb-4 flex flex-col gap-3 text-sm sm:flex-row sm:flex-wrap sm:items-center">
          <span className="font-medium text-gray-700">Registros por página</span>
          <div className="flex flex-wrap items-center gap-2">
            {(['50', '100', '200'] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handlePageSizeChange(option)}
                className={`rounded-full px-3 py-1.5 transition-all ${
                  pageSizeSelection === option
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                }`}
                aria-pressed={pageSizeSelection === option}
              >
                {option}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handlePageSizeChange('more')}
              className={`rounded-full px-3 py-1.5 transition-all ${
                isMoreOptionsOpen
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
              }`}
              aria-pressed={isMoreOptionsOpen}
            >
              ...
            </button>
          </div>
          {isMoreOptionsOpen && (
            <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMoreLimitSelection('all')}
                  className={`rounded px-3 py-2 transition-all ${
                    moreLimitSelection === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Mostrar tudo
                </button>
                <button
                  type="button"
                  onClick={() => setMoreLimitSelection('custom')}
                  className={`rounded px-3 py-2 transition-all ${
                    moreLimitSelection === 'custom'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Escolher
                </button>
              </div>
              {moreLimitSelection === 'custom' && (
                <input
                  type="number"
                  min={1}
                  step={1}
                  value={customLimitInput}
                  onChange={handleCustomLimitChange}
                  placeholder="Digite a quantidade"
                  className="w-full rounded border border-gray-300 px-3 py-2 text-sm sm:w-56"
                />
              )}
            </div>
          )}
        </div>
        <div className="mx-4 mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-gray-700">Filtros</span>
            <button
              type="button"
              onClick={handleClearFilters}
              className="rounded-full border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-white hover:text-blue-700"
            >
              Limpar filtros
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              ID
              <input
                type="number"
                min={1}
                value={filterIdInput}
                onChange={(event) => setFilterIdInput(event.target.value)}
                placeholder="Ex.: 123"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              RE
              <input
                type="number"
                min={1}
                value={filterReInput}
                onChange={(event) => setFilterReInput(event.target.value)}
                placeholder="Ex.: 45678"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Nome do funcionário
              <input
                type="text"
                value={filterEmployeeNameInput}
                onChange={(event) => setFilterEmployeeNameInput(event.target.value)}
                placeholder="Buscar por nome"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Descrição
              <input
                type="text"
                value={filterDescriptionInput}
                onChange={(event) => setFilterDescriptionInput(event.target.value)}
                placeholder="Buscar na descrição"
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Data de criação
              <input
                type="date"
                value={filterCreatedAtInput}
                onChange={(event) => setFilterCreatedAtInput(event.target.value)}
                className="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">
              Status
              <DropdownSelect
                value={filterStatusInput}
                onChange={setFilterStatusInput}
                placeholder="Todos"
                options={STATUS_OPTIONS.map((status) => ({
                  label: translateStatus(status),
                  value: status,
                }))}
                buttonClassName="rounded border border-gray-300 px-3 py-2 text-sm"
              />
            </label>
            <DropdownSelect
              label="Área"
              value={filterAreaInput}
              placeholder="Todas"
              onChange={setFilterAreaInput}
              options={
                areasList?.map((area) => ({
                  label: area.name,
                  value: String(area.id),
                })) ?? []
              }
            />
            <DropdownSelect
              label="Categoria"
              value={filterCategoryInput}
              placeholder="Todas"
              onChange={setFilterCategoryInput}
              options={
                categoryList?.map((category) => ({
                  label: category.name,
                  value: String(category.id),
                })) ?? []
              }
            />
          </div>
          {hasActiveFilters && (
            <p className="mt-3 text-xs text-gray-500">
              Os filtros são aplicados em todas as propostas que você pode visualizar.
            </p>
          )}
        </div>
        <p className="ml-6 mb-2 text-gray-500">{totalCount} propostas encontradas</p>
        <div className="mx-3 flex flex-col justify-center rounded-lg border border-gray-300 text-sm sm:mx-4">
          <div className="hidden grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] rounded-t-lg bg-gray-300 px-4 py-2 text-left font-semibold md:grid">
            <p>ID</p>
            <p>Proposta</p>
            <p>Funcionários</p>
            <p>RE</p>
            <p>Criado em</p>
            <p>Status</p>
          </div>
          {proposalsData.map((proposal) => (
            <ProposalItem key={proposal.id} proposal={proposal} />
          ))}
        </div>
        <div className="mt-4 flex flex-row items-center justify-center gap-2 width-full">
          <button
            type="button"
            onClick={() => previousPage && handlePageChange(previousPage)}
            disabled={!previousPage}
            className="flex items-center gap-1 rounded-lg px-2 py-2 text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeftIcon size={20} />
            <span>Anterior</span>
          </button>
          {visiblePages.map((pageItem, index) =>
            pageItem === 'ellipsis' ? (
              <span key={`ellipsis-${index}`} className="px-1 text-gray-500">
                ...
              </span>
            ) : (
              <button
                key={pageItem}
                type="button"
                onClick={() => handlePageChange(pageItem)}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  pageItem === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-700'
                }`}
                aria-current={pageItem === currentPage ? 'page' : undefined}
              >
                {pageItem}
              </button>
            ),
          )}
          <button
            type="button"
            onClick={() => nextPage && handlePageChange(nextPage)}
            disabled={!nextPage}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-gray-700 transition-all hover:bg-gray-100 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span>Próximo</span>
            <ChevronRightIcon size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default SuggestionList
