import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import EmployeeCombobox from '../../../components/inputs/EmployeeCombobox'
import DropdownSelect from '../../../components/inputs/DropdownSelect'
import { useState } from 'react'
import Modal from '../../../components/modal/Modal'
import type { Category } from '../../../features/category/types'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const updateProposalSchema = z.object({
  championRe: z.coerce.number().int().positive('Selecione um RE valido para o champion.'),
  areaId: z.coerce.number().int().positive('Selecione uma area.'),
  categoryId: z.coerce.number().int().positive('Selecione uma categoria.'),
  isCustomReward: z.boolean(),
})

interface ProposalWithEmployees {
  id: number
  description: string
  status: string
  createdAt: Date
  suggestions: [
    {
      employeeName: string
      employeeRe: number
      employeeShift?: string
      employee?: {
        name: string
        re: number
        role: string
        shift: string
      }
    },
  ]
  area?: {
    id: number
    name: string
  }
}

interface ProposalCardProps {
  proposal: ProposalWithEmployees
  availableChampions:
    | {
        re: number
        name: string
        shift?: string
      }[]
    | undefined
  availableAreas:
    | {
        id: number
        name: string
      }[]
    | undefined
  categories: Category[] | undefined
}

interface Area {
  id: number
  name: string
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  availableChampions,
  availableAreas,
  categories,
}) => {
  type UpdateProposalFormInput = z.input<typeof updateProposalSchema>
  type UpdateProposalFormOutput = z.output<typeof updateProposalSchema>

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<UpdateProposalFormInput, unknown, UpdateProposalFormOutput>({
    resolver: zodResolver(updateProposalSchema),
    defaultValues: {
      areaId: proposal.area?.id,
      categoryId: undefined,
      isCustomReward: false,
    },
  })

  const [updateProposal, { isLoading }] = proposalAPI.useAdminUpdateProposalWithChampionMutation()
  const [rejectProposal, { isLoading: isRejecting }] =
    proposalAPI.useRejectProposalAsAdminMutation()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false)
  const [rejectionNote, setRejectionNote] = useState('')
  const [rejectionNoteError, setRejectionNoteError] = useState<string | null>(null)

  const onSubmit = async (data: UpdateProposalFormOutput) => {
    try {
      await updateProposal({ proposalId: proposal.id.toString(), body: data }).unwrap()
      console.log('Proposal updated successfully')
    } catch (error) {
      console.error('Failed to update proposal:', error)
    }
  }

  const areaIdValue = String(watch('areaId') ?? proposal.area?.id ?? '')
  const categoryIdValue = String(watch('categoryId') ?? '')

  const handleReject = async (note: string) => {
    try {
      await rejectProposal({
        proposalId: proposal.id.toString(),
        rejectionNote: note,
      }).unwrap()
      console.log('Proposal rejected:', proposal.id)
    } catch (error) {
      console.error('Failed to reject proposal:', error)
    }
  }

  return (
    <>
      <form
        className="border border-[#ccc] rounded-md p-4 m-2.5 w-87.5 bg-white flex flex-col"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div onClick={() => setIsModalOpen(true)}>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg m-0">Proposta #{proposal.id}</h3>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>
          <p>
            <strong>Colaboradores:</strong>
          </p>
          <div className="flex flex-wrap gap-2 py-4">
            {proposal.suggestions.map((suggestion, index) => (
              <EmployeeInformationBadge
                key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                suggestion={suggestion}
                id={proposal.id}
              />
            ))}
          </div>

          <p>
            <strong>Proposta:</strong>
            <br />
            <span>
              {proposal.description.length > 100
                ? proposal.description.substring(0, 100).concat('...')
                : proposal.description}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
          <label htmlFor={`area-input-${proposal.id}`}>
            <strong>Área:</strong>
          </label>
          <DropdownSelect
            id={`area-input-${proposal.id}`}
            value={areaIdValue}
            onChange={(value) => setValue('areaId', Number(value), { shouldValidate: true })}
            placeholder="Selecione uma área"
            error={errors.areaId?.message}
            options={
              availableAreas?.map((area: Area) => ({
                value: String(area.id),
                label: area.name,
              })) ?? []
            }
            showEmptyOption={false}
            className="w-full"
            buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-0.5">
            Mantenha a seleção do colaborador ou escolha na lista
          </p>
          <label htmlFor={`category-input-${proposal.id}`}>
            <strong>Categoria:</strong>
          </label>
          <DropdownSelect
            id={`category-input-${proposal.id}`}
            value={categoryIdValue}
            onChange={(value) => setValue('categoryId', Number(value), { shouldValidate: true })}
            placeholder="Selecione uma categoria"
            error={errors.categoryId?.message}
            options={
              categories?.map((category) => ({
                value: String(category.id),
                label: `${category.name} - Recompensa: R$ ${Number(category.categoryReward).toFixed(2)}`,
              })) ?? []
            }
            showEmptyOption={false}
            className="w-full"
            buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
          />
          <p className="text-xs text-gray-500 mt-0.5">Selecione a categoria da proposta.</p>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div className="relative">
              <input type="checkbox" className="sr-only peer" {...register('isCustomReward')} />
              <div className="h-6 w-11 rounded-full bg-gray-300 transition-colors peer-checked:bg-blue-600 peer-focus:ring-2 peer-focus:ring-blue-300"></div>
              <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5"></div>
            </div>
            <span className="text-xs font-medium text-gray-700">Prêmio a definir</span>
          </label>
          <label htmlFor={`champion-input-${proposal.id}`}>
            <strong>Defina o Executor:</strong>
          </label>
          <EmployeeCombobox
            name={`champion-input-${proposal.id}`}
            listId={`employees-list-${proposal.id}`}
            employees={availableChampions || []}
            required
            placeholder="Digite ou selecione o RE"
            onSelect={(value) => {
              setValue('championRe', Number(value), { shouldValidate: true })
            }}
            dropdownOverlap={true}
          />
          <input type="hidden" {...register('championRe', { valueAsNumber: true })} />
          {errors.championRe && <p className="text-sm text-red-600">{errors.championRe.message}</p>}
          <div className="w-full">
            <button
              type="submit"
              disabled={isLoading || isRejecting}
              className="py-2 px-3 cursor-pointer rounded border bg-blue-500 text-white w-1/2 hover:cursor-pointer hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Salvando...' : 'Definir dados'}
            </button>
            <button
              type="button"
              onClick={() => {
                setRejectionNote('')
                setRejectionNoteError(null)
                setIsRejectionModalOpen(true)
              }}
              disabled={isLoading || isRejecting}
              className="py-2 px-3 cursor-pointer rounded border bg-red-500 text-white w-1/2 hover:cursor-pointer hover:bg-red-700 transition-colors"
            >
              {isRejecting ? 'Rejeitando...' : 'Rejeitar'}
            </button>
          </div>
        </div>
      </form>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-auto max-w-100 p-4 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>

          <div className="flex justify-start">
            <div className="bg-gray-50 rounded p-3 min-w-30">
              <p className="text-xs text-gray-500">Area</p>
              <p className="font-medium">{proposal.area?.name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Descrição</p>
            <p className="text-gray-700 leading-relaxed">{proposal.description}</p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Funcionários</p>
            <div className="flex flex-wrap gap-2">
              {proposal.suggestions.map((suggestion, index) => (
                <p
                  key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                  className="bg-gray-100 px-2 py-1 rounded text-sm"
                >
                  <span className="text-gray-700 font-bold">
                    {suggestion.employee ? suggestion.employee.name : suggestion.employeeName}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {suggestion.employee ? suggestion.employee.re : suggestion.employeeRe}
                    {' - '}
                    Turno:{' '}
                    {suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift}
                  </span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isRejectionModalOpen} onClose={() => setIsRejectionModalOpen(false)}>
        <div className="w-100 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold">Informar motivo da rejeicao</h2>
          <p className="text-gray-700">Descreva o motivo para rejeitar esta proposta.</p>
          <textarea
            value={rejectionNote}
            onChange={(event) => {
              setRejectionNote(event.target.value)
              if (rejectionNoteError) setRejectionNoteError(null)
            }}
            rows={4}
            maxLength={1000}
            className="w-full rounded border border-gray-300 p-3"
            placeholder="Digite o motivo da rejeicao"
          />
          {rejectionNoteError && <p className="text-sm text-red-600">{rejectionNoteError}</p>}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => setIsRejectionModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={async () => {
                const normalizedRejectionNote = rejectionNote.trim()
                if (!normalizedRejectionNote) {
                  setRejectionNoteError('Informe o motivo da rejeicao.')
                  return
                }

                await handleReject(normalizedRejectionNote)
                setIsRejectionModalOpen(false)
              }}
              className="py-2 px-4 cursor-pointer rounded border border-[#c0392b] bg-[#e74c3c] hover:bg-[#c0392b] text-white transition-all"
            >
              Confirmar rejeicao
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
