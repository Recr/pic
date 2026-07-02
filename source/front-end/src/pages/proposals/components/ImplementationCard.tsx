import { useEffect, useRef, useState } from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/badges/StatusBadge'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import type { ProposalWithSuggestions } from '../../../features/proposal/types'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type z from 'zod'
import { getFinishProposalSchema } from '../../../validation/schemas/proposal-schemas'
import { toast } from 'react-toastify'
import { Undo2 } from 'lucide-react'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const ImplementationCard: React.FC<ProposalWithSuggestions> = (proposal) => {
  const [proposalChampionReview] = proposalAPI.useProposalChampionReviewMutation()
  const [updateChampionNotes] = proposalAPI.useUpdateChampionNotesMutation()
  const [undoImplementationToToImplement, { isLoading: isUndoLoading }] =
    proposalAPI.useUndoImplementationToToImplementMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false)
  const [isUndoModalOpen, setIsUndoModalOpen] = useState(false)
  const [note, setNote] = useState(proposal.notes ?? '')
  const [isSavingNote, setIsSavingNote] = useState(false)
  const [noteSaveError, setNoteSaveError] = useState<string | null>(null)
  const lastSavedNoteRef = useRef(proposal.notes ?? '')
  const finishProposalSchema = getFinishProposalSchema(proposal.isCustomReward)

  type FinishProposalImplementationInputSchema = z.input<typeof finishProposalSchema>
  type FinishProposalImplementationOutputSchema = z.output<typeof finishProposalSchema>

  const {
    handleSubmit,
    register,
    watch,
    formState: { errors },
  } = useForm<
    FinishProposalImplementationInputSchema,
    undefined,
    FinishProposalImplementationOutputSchema
  >({
    resolver: zodResolver(finishProposalSchema),
  })

  const watchedCustomRewardAmount = watch('customRewardAmount')
  const watchedEvidenceFiles = watch('evidenceFiles') as FileList | undefined

  useEffect(() => {
    setNote(proposal.notes ?? '')
    lastSavedNoteRef.current = proposal.notes ?? ''
  }, [proposal.id, proposal.notes])

  useEffect(() => {
    if (note === lastSavedNoteRef.current) {
      return
    }

    const timeoutId = setTimeout(async () => {
      try {
        setIsSavingNote(true)
        setNoteSaveError(null)
        await updateChampionNotes({
          proposalId: proposal.id.toString(),
          body: { notes: note },
        }).unwrap()
        lastSavedNoteRef.current = note
      } catch (_error) {
        setNoteSaveError('Nao foi possivel salvar a nota automaticamente.')
      } finally {
        setIsSavingNote(false)
      }
    }, 700)

    return () => clearTimeout(timeoutId)
  }, [note, proposal.id, updateChampionNotes])

  const onSubmit: SubmitHandler<FinishProposalImplementationOutputSchema> = async ({
    customRewardAmount,
    evidenceFiles,
  }) => {
    try {
      const formData = new FormData()
      formData.append('status', 'IMPLEMENTED')

      if (customRewardAmount !== undefined) {
        formData.append('customRewardAmount', String(customRewardAmount))
      }

      if (evidenceFiles && evidenceFiles.length > 0) {
        evidenceFiles.forEach((file) => {
          formData.append('evidenceFiles', file)
        })
      }
      console.log(formData.getAll('evidenceFiles'))

      await proposalChampionReview({
        proposalId: proposal.id.toString(),
        data: formData as any,
      }).unwrap()
      toast.success('Proposta concluída com sucesso.')
      setIsConfirmationModalOpen(false)
    } catch (error) {
      console.log(error)
      toast.error('Erro ao concluir a proposta.')
    }
  }

  const handleUndoStatus = async () => {
    try {
      await undoImplementationToToImplement({ proposalId: proposal.id.toString() }).unwrap()
      setIsUndoModalOpen(false)
      toast.success('Status retornado para "A Implementar" com sucesso.')
    } catch (error) {
      console.log(error)
      toast.error('Erro ao retornar status da proposta.')
    }
  }

  return (
    <div className="w-full border border-[#ccc] rounded-md p-4 bg-white flex flex-col justify-between">
      <div onClick={() => setIsModalOpen(true)} className="relative">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg m-0">Sugestão #{proposal.id}</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setIsUndoModalOpen(true)
              }}
              title="Retornar para A Implementar"
              className="inline-flex h-8 w-8 items-center justify-center rounded border border-orange-200 text-orange-600 transition-colors hover:cursor-pointer hover:bg-orange-50"
            >
              <Undo2 size={16} />
            </button>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>
        </div>
        <div className="flex justify-between">
          <strong>Data: </strong>
          <span>{new Date(proposal.createdAt).toLocaleDateString()}</span>
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
        <div className="flex justify-between">
          <div className="flex flex-col">
            <strong>Área</strong>
            <span>{proposal.area.name}</span>
          </div>
          <div className="flex flex-col">
            <strong>Categoria</strong>
            <span>{proposal.category.name}</span>
          </div>
        </div>

        <p className="text-justify overflow-clip mb-15">
          <strong>Sugestão:</strong>
          <br />
          <span>
            {proposal.description.length > 150
              ? proposal.description.substring(0, 150).concat('...')
              : proposal.description}
          </span>
        </p>
        {proposal.managerNotes && (
          <p className="mt-2 mb-2 text-sm text-gray-700 line-clamp-2">
            <strong>Obs. Gestor:</strong> {proposal.managerNotes}
          </p>
        )}
        <form>
          {proposal.isCustomReward && (
            <div className="flex flex-col">
              <label htmlFor="customRewardAmount">Valor da recompensa</label>
              <div className="relative mt-2">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  R$
                </span>

                <input
                  id={`custom-reward-amount-input-${proposal.id}`}
                  {...register('customRewardAmount', {
                    setValueAs: (value) => Number(value.replace(/\./g, '').replace(',', '.')),
                  })}
                  type="text"
                  placeholder="0,00"
                  className="w-full p-2 pl-10 border border-gray-300 rounded"
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').replace(/^0+/, '')

                    e.target.value = value
                      ? (Number(value) / 100).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })
                      : ''
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              {errors.customRewardAmount && (
                <span className="text-xs text-red-600">{errors.customRewardAmount.message}</span>
              )}
            </div>
          )}
          <div className="flex flex-col mt-3">
            <label htmlFor="rewardAttachment">A3 ou (e) Antes e Depois</label>
            <input
              id="rewardAttachment"
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,.xlsx,.xls,.ppt,.pptx"
              onClick={(e) => e.stopPropagation()}
              className="border border-gray-300 rounded px-4 py-2 hover:cursor-pointer hover:bg-blue-100 transition-colors"
              multiple={true}
              {...register('evidenceFiles')}
            />
            {errors.evidenceFiles && (
              <span className="text-xs text-red-600">{errors.evidenceFiles.message}</span>
            )}
          </div>
          <div className="flex flex-col mt-3" onClick={(e) => e.stopPropagation()}>
            <label htmlFor={`proposal-note-${proposal.id}`}>Notas da implementacao</label>
            <textarea
              id={`proposal-note-${proposal.id}`}
              rows={4}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              className="border border-gray-300 rounded px-4 py-2"
              placeholder="Digite observacoes da implementacao"
              maxLength={1000}
            />
            <span className="text-xs text-gray-500 mt-1">
              {isSavingNote ? 'Salvando nota...' : 'A nota e salva automaticamente.'}
            </span>
            {noteSaveError && <span className="text-xs text-red-600">{noteSaveError}</span>}
          </div>
          <div className="flex gap-2 items-center pt-4 " onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setIsConfirmationModalOpen(true)}
              className="py-2 px-2 cursor-pointer rounded border border-green-800 bg-green-500 hover:bg-green-700 text-white transition-all"
            >
              Concluir
            </button>
          </div>
        </form>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-auto max-w-130 p-4 space-y-5">
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
              <p className="font-medium">{proposal.area.name}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-medium">
                {proposal.category?.name ? proposal.category.name : 'Nenhuma'}
              </p>
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
      <Modal isOpen={isConfirmationModalOpen} onClose={() => setIsConfirmationModalOpen(false)}>
        <div className="w-80 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">Confirmar conclusão</h2>
          <p className="text-gray-700 text-center">
            Tem <strong>certeza</strong> que deseja marcar esta proposta como concluída?
          </p>
          {(watchedCustomRewardAmount || (watchedEvidenceFiles?.length ?? 0) > 0) && (
            <div className="text-gray-700 border p-2 rounded-xl border-gray-200 hover:shadow-md transition-all">
              <span>Confira os detalhes:</span>
              {watchedCustomRewardAmount !== undefined && (
                <p className="text-xs mt-2 bg-gray-100 rounded p-2">
                  Valor da recompensa: R$ {Number(watchedCustomRewardAmount ?? 0).toFixed(2)}
                </p>
              )}
              <p className="text-xs mt-2 bg-gray-100 rounded p-2">
                Evidências:{' '}
                {(watchedEvidenceFiles?.length ?? 0) > 0 ? (
                  <span>{watchedEvidenceFiles?.length} arquivo(s)</span>
                ) : (
                  <span>Nenhuma evidência adicionada</span>
                )}
              </p>
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsConfirmationModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="py-2 px-4 cursor-pointer rounded border border-green-800 bg-green-500 hover:bg-green-700 text-white transition-all"
            >
              Confirmar
            </button>
          </div>
          <div className="flex flex-col gap-2 text-center">
            {errors.customRewardAmount && (
              <span className="text-xs text-red-600">{errors.customRewardAmount.message}</span>
            )}
            {errors.evidenceFiles && (
              <span className="text-xs text-red-600">{errors.evidenceFiles.message}</span>
            )}
          </div>
        </div>
      </Modal>
      <Modal isOpen={isUndoModalOpen} onClose={() => setIsUndoModalOpen(false)}>
        <div className="w-80 max-w-[95vw] p-6 space-y-4">
          <h2 className="text-lg font-semibold text-center">Confirmar retorno de status</h2>
          <p className="text-gray-700 text-center">
            Tem <strong>certeza</strong> que deseja retornar esta proposta para "A Implementar" ?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              type="button"
              onClick={() => setIsUndoModalOpen(false)}
              className="py-2 px-4 cursor-pointer rounded border border-gray-300 bg-gray-100 hover:bg-gray-200 text-gray-800 transition-all"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleUndoStatus}
              disabled={isUndoLoading}
              className="py-2 px-4 cursor-pointer rounded border border-orange-800 bg-orange-500 hover:bg-orange-700 text-white transition-all disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isUndoLoading ? 'Retornando...' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ImplementationCard
