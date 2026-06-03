import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import StatusBadge from '../../../components/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import EmployeeCombobox from '../../../components/EmployeeCombobox'
import { useState } from 'react'
import Modal from '../../../components/modal/Modal'

const updateProposalSchema = z.object({
  championRe: z.coerce.number().int().positive('Selecione um RE valido para o executor.'),
  managerNotes: z
    .string()
    .trim()
    .max(1000, 'As Observações do gestor devem ter no maximo 1000 caracteres.')
    .optional(),
})

interface ProposalWithEmployees {
  id: number
  description: string
  status: string
  createdAt: Date
  managerNotes?: string | null
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
}

export const ProposalCard: React.FC<ProposalCardProps> = ({ proposal, availableChampions }) => {
  type UpdateProposalFormInput = z.input<typeof updateProposalSchema>
  type UpdateProposalFormOutput = z.output<typeof updateProposalSchema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateProposalFormInput, unknown, UpdateProposalFormOutput>({
    resolver: zodResolver(updateProposalSchema),
  })

  const [updateProposal, { isLoading }] = proposalAPI.useUpdateProposalWithChampionMutation()
  const [rejectProposal, { isLoading: isRejecting }] =
    proposalAPI.useRejectProposalAsManagerMutation()

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

  const employees = proposal.suggestions?.map((suggestion) => ({
    name: suggestion.employee ? suggestion.employee.name : suggestion.employeeName,
    re: suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
    shift: suggestion.employee ? suggestion.employee.shift : suggestion.employeeShift,
  }))

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
            <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>
          <p>
            <strong>Colaboradores:</strong>
          </p>
          <ul className="ml-5">
            {!proposal.suggestions ? (
              <p>Nenhum colaborador encontrado</p>
            ) : (
              employees.map((employee, i) => {
                return (
                  <li key={i}>
                    {employee.name} (RE: {employee.re}) - Turno: {employee.shift}
                  </li>
                )
              })
            )}
          </ul>

          <p>
            <strong>Sugestão:</strong>
            <br />
            <span>
              {proposal.description.length > 100
                ? proposal.description.substring(0, 100).concat('...')
                : proposal.description}
            </span>
          </p>
        </div>

        <div className="flex flex-col gap-2 items-start my-5 pt-2.5 border-t border-[#eee]">
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
          />
          <input type="hidden" {...register('championRe', { valueAsNumber: true })} />
          {errors.championRe && <p className="text-sm text-red-600">{errors.championRe.message}</p>}
          <label htmlFor={`manager-notes-${proposal.id}`}>
            <strong>Observações do Gestor:</strong>
          </label>
          <textarea
            id={`manager-notes-${proposal.id}`}
            rows={4}
            placeholder="Digite Observações para o champion"
            className="w-full rounded border border-[#ccc] p-2"
            defaultValue={proposal.managerNotes ?? ''}
            {...register('managerNotes')}
          />
          {errors.managerNotes && (
            <p className="text-sm text-red-600">{errors.managerNotes.message}</p>
          )}
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
        <div className="w-100 max-w-[95vw] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Area</p>
              <p className="font-medium">{proposal.area?.name}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Descrição</p>
            <p className="text-gray-700 leading-relaxed">{proposal.description}</p>
          </div>

          {proposal.managerNotes && (
            <div>
              <p className="text-sm font-semibold mb-1">Observações do Gestor</p>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {proposal.managerNotes}
              </p>
            </div>
          )}

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
