import React, { useState } from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/badges/StatusBadge'
import type { ProposalDetailed } from '../../../features/proposal/types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { toast } from 'react-toastify'
import {
  Undo2,
  Trash2,
  Undo,
  UserIcon,
  IdCardIcon,
  CalendarIcon,
  ChevronRightIcon,
} from 'lucide-react'
import UndoStatusModal from './UndoStatusModal'
import EmployeeCombobox from '../../../components/inputs/EmployeeCombobox'
import { employeeAPI } from '../../../features/employee/employee-api'
import type z from 'zod'
import { updateManagerOrChampionSchema } from '../../../validation/schemas/employee-schemas'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod/src/zod.js'
import { translateRoles } from '../../../helpers/translateRoles'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

const MAX_ATTACHMENTS_PER_UPLOAD = 5
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

const ProposalItem: React.FC<{ proposal: ProposalDetailed }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isUndoModalOpen, setIsUndoModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isRestoreModalOpen, setIsRestoreModalOpen] = React.useState(false)
  const [isUpdateManagerModalOpen, setIsUpdateManagerModalOpen] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [removingAttachmentId, setRemovingAttachmentId] = React.useState<number | null>(null)
  const [selectedUndoType, setSelectedUndoType] = React.useState<
    | 'IMPLEMENTED_TO_WAITING_APPROVAL'
    | 'IMPLEMENTED_TO_IMPLEMENTATION'
    | 'IMPLEMENTATION_TO_TO_IMPLEMENT'
    | 'TO_IMPLEMENT_TO_UNDER_VALIDATION'
    | 'REJECTED_TO_UNDER_VALIDATION'
    | 'REJECTED_TO_DEFINE_CHAMPION'
    | null
  >(null)

  const [uploadAttachments, { isLoading: isUploadingAttachments }] =
    proposalAPI.useUploadProposalAttachmentsMutation()
  const [deleteAttachment, { isLoading: isDeletingAttachment }] =
    proposalAPI.useDeleteProposalAttachmentMutation()
  const [
    undoImplementedToWaitingApproval,
    { isLoading: isUndoFinishedWithoutImplementationLoading },
  ] = proposalAPI.useUndoImplementedToWaitingApprovalMutation()
  const [undoImplementedToImplementation, { isLoading: isUndoImplementedLoading }] =
    proposalAPI.useUndoImplementedToImplementationMutation()
  const [undoImplementationToToImplement, { isLoading: isUndoImplementationLoading }] =
    proposalAPI.useUndoImplementationToToImplementMutation()
  const [undoToImplementToUnderValidation, { isLoading: isUndoToImplementLoading }] =
    proposalAPI.useUndoToImplementToUnderValidationMutation()
  const [undoRejectedToUnderValidation, { isLoading: isUndoRejectedValidationLoading }] =
    proposalAPI.useUndoRejectedToUnderValidationMutation()
  const [undoRejectedToDefineChampion, { isLoading: isUndoRejectedChampionLoading }] =
    proposalAPI.useUndoRejectedToDefineChampionMutation()
  const [softDeleteProposal, { isLoading: isSoftDeleteLoading }] =
    proposalAPI.useSoftDeleteProposalMutation()
  const [restoreProposal, { isLoading: isRestoringLoading }] =
    proposalAPI.useRestoreProposalMutation()
  const [updateProposalManager] = proposalAPI.useUpdateProposalManagerMutation()
  const [updateProposalChampion] = proposalAPI.useUpdateProposalChampionMutation()
  const user = useSelector((state: RootState) => state.auth.user)
  const { data: employeeList } = employeeAPI.useGetEmployeesQuery()

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.re !== undefined && proposal.manager?.re === user.re
  const isChampion = user?.re !== undefined && proposal.champion?.re === user.re
  const canEditAttachments = Boolean(isAdmin || isManager || isChampion)
  const fileInputId = `attachment-input-${proposal.id}`

  const getUndoLoading = () => {
    switch (selectedUndoType) {
      case 'IMPLEMENTED_TO_WAITING_APPROVAL':
        return isUndoFinishedWithoutImplementationLoading
      case 'IMPLEMENTED_TO_IMPLEMENTATION':
        return isUndoImplementedLoading
      case 'IMPLEMENTATION_TO_TO_IMPLEMENT':
        return isUndoImplementationLoading
      case 'TO_IMPLEMENT_TO_UNDER_VALIDATION':
        return isUndoToImplementLoading
      case 'REJECTED_TO_UNDER_VALIDATION':
        return isUndoRejectedValidationLoading
      case 'REJECTED_TO_DEFINE_CHAMPION':
        return isUndoRejectedChampionLoading
      default:
        return false
    }
  }

  const borderColors: Record<string, string> = {
    IMPLEMENTED: 'border-green-300',
    REJECTED: 'border-red-300',
    DEFINE_CHAMPION: 'border-blue-300',
    WAITING_APPROVAL: 'border-orange-300',
    UNDER_VALIDATION: 'border-orange-300',
    TO_IMPLEMENT: 'border-yellow-300',
    IMPLEMENTATION: 'border-cyan-300',
    NOT_VIABLE: 'border-gray-300',
    PENDING: 'border-orange-300',
    PAID: 'border-green-300',
    CANCELLED: 'border-red-300',
  }

  const getAvailableUndoActions = () => {
    const actions: (typeof selectedUndoType)[] = []

    if (
      proposal.status === 'IMPLEMENTED' &&
      !proposal.requiresImplementation &&
      (isAdmin || isManager)
    ) {
      actions.push('IMPLEMENTED_TO_WAITING_APPROVAL')
    }

    if (proposal.status === 'IMPLEMENTED' && (isAdmin || isChampion)) {
      actions.push('IMPLEMENTED_TO_IMPLEMENTATION')
    }

    if (proposal.status === 'IMPLEMENTATION' && isChampion) {
      actions.push('IMPLEMENTATION_TO_TO_IMPLEMENT')
    }

    if (proposal.status === 'TO_IMPLEMENT' && isChampion) {
      actions.push('TO_IMPLEMENT_TO_UNDER_VALIDATION')
    }

    if ((proposal.status === 'REJECTED' || proposal.status === 'NOT_VIABLE') && isChampion) {
      actions.push('REJECTED_TO_UNDER_VALIDATION')
    }

    if (proposal.status === 'REJECTED' && (isAdmin || isManager) && !proposal.champion) {
      actions.push('REJECTED_TO_DEFINE_CHAMPION')
    }

    return actions
  }

  const getPrimaryUndoAction = () => {
    const actions = getAvailableUndoActions()
    return actions.length > 0 ? actions[0] : null
  }

  const handleUndoClick = () => {
    const undoType = getPrimaryUndoAction()
    if (!undoType) {
      return
    }
    setSelectedUndoType(undoType)
    setIsUndoModalOpen(true)
  }

  const handleConfirmUndo = async () => {
    if (!selectedUndoType) {
      return
    }

    try {
      switch (selectedUndoType) {
        case 'IMPLEMENTED_TO_WAITING_APPROVAL':
          await undoImplementedToWaitingApproval({ proposalId: proposal.id.toString() }).unwrap()
          break
        case 'IMPLEMENTED_TO_IMPLEMENTATION':
          await undoImplementedToImplementation({ proposalId: proposal.id.toString() }).unwrap()
          break
        case 'IMPLEMENTATION_TO_TO_IMPLEMENT':
          await undoImplementationToToImplement({ proposalId: proposal.id.toString() }).unwrap()
          break
        case 'TO_IMPLEMENT_TO_UNDER_VALIDATION':
          await undoToImplementToUnderValidation({ proposalId: proposal.id.toString() }).unwrap()
          break
        case 'REJECTED_TO_UNDER_VALIDATION':
          await undoRejectedToUnderValidation({ proposalId: proposal.id.toString() }).unwrap()
          break
        case 'REJECTED_TO_DEFINE_CHAMPION':
          await undoRejectedToDefineChampion({ proposalId: proposal.id.toString() }).unwrap()
          break
      }

      setIsUndoModalOpen(false)
      setSelectedUndoType(null)
      toast.success('Ação desfeita com sucesso.')
    } catch (error) {
      toast.error(`Erro ao desfazer ação: ${getErrorMessage(error)}`)
    }
  }

  const handleConfirmDelete = async () => {
    try {
      await softDeleteProposal({ proposalId: proposal.id.toString() }).unwrap()
      setIsModalOpen(false)
      setIsDeleteModalOpen(false)
      toast.success('Proposta deletada com sucesso.')
    } catch (error) {
      toast.error(`Erro ao deletar proposta: ${getErrorMessage(error)}`)
    }
  }

  const handleConfirmRestore = async () => {
    try {
      await restoreProposal({ proposalId: proposal.id.toString() }).unwrap()
      setIsModalOpen(false)
      setIsRestoreModalOpen(false)
      toast.success('Proposta restaurada com sucesso.')
    } catch (error) {
      toast.error(`Erro ao restaurar proposta: ${getErrorMessage(error)}`)
    }
  }

  const getErrorMessage = (error: unknown) => {
    if (
      typeof error === 'object' &&
      error !== null &&
      'data' in error &&
      typeof (error as { data?: unknown }).data === 'object' &&
      (error as { data?: { message?: unknown } }).data !== null &&
      typeof (error as { data?: { message?: unknown } }).data?.message === 'string'
    ) {
      return (error as { data?: { message?: string } }).data?.message
    }

    if (error instanceof Error) {
      return error.message
    }

    return 'Falha inesperada.'
  }

  const handleDownloadAttachment = async (
    proposalId: number,
    attachmentId: number,
    filename: string,
  ) => {
    try {
      console.log('Starting download:', { proposalId, attachmentId, filename })

      const link = document.createElement('a')
      link.href = `/api/proposals/${proposalId}/attachments/${attachmentId}/download`
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Erro ao baixar arquivo: ${getErrorMessage(error)}`)
    }
  }

  const handleUploadAttachments = async () => {
    if (selectedFiles.length === 0) {
      toast.warning('Selecione ao menos um arquivo para anexar.')
      return
    }

    try {
      await uploadAttachments({ proposalId: proposal.id, files: selectedFiles }).unwrap()
      setSelectedFiles([])
      toast.success('Arquivos anexados com sucesso.')
    } catch (error) {
      toast.error(`Erro ao anexar arquivos: ${getErrorMessage(error)}`)
    }
  }

  const handleRemoveAttachment = async (attachmentId: number) => {
    const shouldDelete = window.confirm('Deseja remover este arquivo anexado?')
    if (!shouldDelete) {
      return
    }

    try {
      setRemovingAttachmentId(attachmentId)
      await deleteAttachment({ proposalId: proposal.id, attachmentId }).unwrap()
      toast.success('Arquivo removido com sucesso.')
    } catch (error) {
      toast.error(`Erro ao remover arquivo: ${getErrorMessage(error)}`)
    } finally {
      setRemovingAttachmentId(null)
    }
  }

  type UpdateManagerFormInput = z.input<typeof updateManagerOrChampionSchema>
  type UpdateManagerFormOutput = z.output<typeof updateManagerOrChampionSchema>

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UpdateManagerFormInput, unknown, UpdateManagerFormOutput>({
    resolver: zodResolver(updateManagerOrChampionSchema),
    defaultValues: {
      managerOrChampionRe: proposal.manager?.re,
    },
  })

  type EmployeeType = 'MANAGER' | 'CHAMPION' | null
  const [employeeType, setEmployeeType] = useState<EmployeeType>(null)

  const handleUpdateProposalManagerOrChampion = async (data: UpdateManagerFormOutput) => {
    try {
      if (employeeType === 'MANAGER') {
        await updateProposalManager({
          proposalId: proposal.id.toString(),
          managerRe: data.managerOrChampionRe,
        }).unwrap()
        console.log('Proposal updated successfully')
      } else if (employeeType === 'CHAMPION') {
        await updateProposalChampion({
          proposalId: proposal.id.toString(),
          championRe: data.managerOrChampionRe,
        }).unwrap()
        console.log('Proposal updated successfully')
      } else {
        toast.error('Tipo de colaborador não selecionado.')
        throw new Error('Tipo de colaborador não selecionado.')
      }

      toast.success('Proposta atualizada com sucesso.')
    } catch (error) {
      console.error('Failed to update proposal:', error)
      toast.error('Erro ao atualizar proposta.')
    } finally {
      setEmployeeType(null)
      setIsUpdateManagerModalOpen(false)
    }
  }

  const canEditManager = user?.role === 'ADMIN'
  const canEditChampion =
    user?.role === 'ADMIN' ? true : user?.re === proposal.manager?.re ? true : false

  return (
    <>
      {/* sm:px-4 md:grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] md:gap-0 md:py-2 */}
      {/* ${proposal.isActive ? 'hover:bg-blue-100 border-gray-200' : 'bg-red-100  border-red-200 hover:bg-red-300 hover:border-red-400'} */}
      <div
        className={`bg-gray-50 rounded-lg md:rounded-none flex flex-1 px-3 py-3 md:py-0 text-left shadow-lg md:shadow-sm hover:bg-blue-50 text-sm hover:cursor-pointer transition-all ${borderColors[proposal.status] ?? 'border-gray-300'} border-l-8 md:border-l-4 hover:translate-y-1 hover:animate-pulse`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex flex-1 flex-col gap-3 md:grid md:grid-cols-[56px_2fr_2fr_1fr_0.8fr_1fr] lg:grid-cols-[56px_2fr_2fr_1fr_0.55fr_1fr] xl:grid-cols-[56px_2fr_2fr_1fr_0.4fr_1fr] md:gap-0 md:py-1">
          <div className="flex justify-between">
            <p className="font-semibold text-lg md:text-sm flex items-center">
              <span className="md:hidden">#</span>
              {proposal.id}
            </p>
            <StatusBadge
              status={proposal.status}
              color={getStatusColor(proposal.status)}
              className="flex md:hidden lg:hidden"
            />
          </div>
          <p className="font-semibold md:font-normal text-md md:text-xs mb-2 md:mb-0 flex items-center md:pr-4">
            {proposal.description.length > 45
              ? `${proposal.description.substring(0, 45)}...`
              : proposal.description}
          </p>
          <p className="flex items-center gap-2 text-gray-700 text-xs md:pr-4">
            <UserIcon size={16} className="text-gray-400 md:hidden" />
            {proposal.suggestions
              .map((suggestion) =>
                suggestion.employee ? suggestion.employee.name : suggestion.employeeName,
              )
              .join(', ')
              .substring(0, 45)}
          </p>
          <div className="flex gap-3 md:hidden">
            <p className="flex items-center gap-2 text-gray-700 text-xs">
              <IdCardIcon size={16} className="text-gray-400 md:hidden" />
              <span className="md:hidden">RE</span>
              {proposal.suggestions
                .map((suggestion) =>
                  suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
                )
                .join(', ')}
            </p>
            <p className="flex items-center gap-2 text-gray-700 text-xs">
              <CalendarIcon size={16} className="text-gray-400 md:hidden" />
              {new Date(proposal.createdAt).toLocaleDateString()}
            </p>
          </div>
          <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
            <IdCardIcon size={16} className="text-gray-400 md:hidden" />
            <span className="md:hidden">RE</span>
            {proposal.suggestions
              .map((suggestion) =>
                suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
              )
              .join(', ')}
          </p>
          <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
            <CalendarIcon size={16} className="text-gray-400 md:hidden" />
            {new Date(proposal.createdAt).toLocaleDateString()}
          </p>
          <StatusBadge
            status={proposal.status}
            color={getStatusColor(proposal.status)}
            className="hidden md:flex lg:flex "
            hasText={false}
          />
        </div>
        <ChevronRightIcon size={32} className="text-gray-400 self-center md:hidden" />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full sm:max-w-11/12 space-y-4 p-4 md:max-w-[70vw]  sm:p-6 lg:w-152">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
            <div>
              <div className="flex gap-2">
                <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
                <p
                  className={`${!proposal.isLegacy && 'hidden'} bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 rounded flex items-center justify-center`}
                >
                  {proposal.isLegacy && 'Legado'}
                </p>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {getPrimaryUndoAction() && (
                <button
                  type="button"
                  onClick={handleUndoClick}
                  title="Desfazer para status anterior"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-orange-200 text-orange-600 transition-colors hover:cursor-pointer hover:bg-orange-50"
                >
                  <Undo2 size={16} />
                </button>
              )}
              {isAdmin && proposal.isActive && (
                <button
                  type="button"
                  onClick={() => setIsDeleteModalOpen(true)}
                  disabled={isSoftDeleteLoading}
                  title="Deletar proposta"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <Trash2 size={16} />
                </button>
              )}
              {isAdmin && !proposal.isActive && (
                <button
                  type="button"
                  onClick={() => setIsRestoreModalOpen(true)}
                  disabled={isRestoringLoading}
                  title="Restaurar proposta"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-green-200 text-green-600 transition-colors hover:cursor-pointer hover:bg-green-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <Undo size={16} />
                </button>
              )}
              <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
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
          {proposal.rejectionNote && (
            <div className="bg-red-100 rounded p-2">
              <p className="text-sm font-semibold mb-1">Motivo de Rejeição</p>
              <p className="text-gray-700 leading-relaxed">{proposal.rejectionNote}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold mb-2">Colaboradores</p>
            <div className="flex flex-wrap gap-2">
              {proposal.suggestions.map((suggestion, index) => (
                <EmployeeInformationBadge
                  key={`${proposal.id}-${suggestion.employee?.name || suggestion.employeeName}-${index}`}
                  suggestion={suggestion}
                  id={proposal.id}
                />
              ))}
            </div>
          </div>
          {proposal.manager && (
            <div>
              <p className="text-sm font-semibold mb-2">Gestor</p>
              <div className="flex flex-wrap gap-2">
                <p
                  onClick={() => {
                    if (canEditManager) {
                      setEmployeeType('MANAGER')
                      setIsUpdateManagerModalOpen(true)
                    }
                  }}
                  className={`bg-gray-100 px-2 py-1 rounded text-sm ${canEditManager ? 'border border-blue-300 border-dashed hover:cursor-pointer hover:bg-blue-50 hover:border-blue-400' : ''} transition-colors`}
                >
                  <span className="text-gray-700 font-bold">{proposal.manager.name}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {proposal.manager.re}
                    {' - '}
                    Turno: {proposal.manager.shift}
                  </span>
                </p>
              </div>
            </div>
          )}
          {proposal.champion && (
            <div>
              <p className="text-sm font-semibold mb-2">Executor</p>
              <div className="flex flex-wrap gap-2">
                <p
                  onClick={() => {
                    if (canEditChampion) {
                      setEmployeeType('CHAMPION')
                      setIsUpdateManagerModalOpen(true)
                    }
                  }}
                  className={`bg-gray-100 px-2 py-1 rounded text-sm ${canEditChampion ? 'border border-blue-300 border-dashed hover:cursor-pointer hover:bg-blue-50 hover:border-blue-400' : ''} transition-colors`}
                >
                  <span className="text-gray-700 font-bold">{proposal.champion.name}</span>
                  <span className="text-xs text-gray-500 ml-1">
                    {proposal.champion.re}
                    {' - '}
                    Turno: {proposal.champion.shift}
                  </span>
                </p>
              </div>
            </div>
          )}
          <div>
            <p className="mb-2 text-sm font-semibold">Arquivos Anexados</p>

            {canEditAttachments ? (
              <div className="mb-3 rounded border border-dashed border-gray-300 bg-gray-50 p-3">
                <label
                  htmlFor={fileInputId}
                  className="flex cursor-pointer flex-col items-center justify-center rounded border border-dashed border-blue-300 bg-blue-50 px-4 py-5 text-center transition-colors hover:bg-blue-100"
                  title="Clique para selecionar arquivos"
                >
                  <span className="text-sm font-medium text-blue-700">
                    Clique aqui para selecionar arquivos
                  </span>
                  <span className="mt-1 text-xs text-blue-600">
                    Máximo de 5 arquivos por envio, até 10 MB cada.
                  </span>
                </label>
                <input
                  id={fileInputId}
                  type="file"
                  multiple
                  title="Selecionar arquivos para anexar"
                  onChange={(event) => {
                    const fileList = event.target.files
                    const files = fileList ? Array.from(fileList) : []

                    if (files.length > MAX_ATTACHMENTS_PER_UPLOAD) {
                      toast.warning(
                        `Você pode anexar no máximo ${MAX_ATTACHMENTS_PER_UPLOAD} arquivos por envio.`,
                      )
                      event.currentTarget.value = ''
                      setSelectedFiles([])
                      return
                    }

                    const oversizedFiles = files.filter(
                      (file) => file.size > MAX_ATTACHMENT_SIZE_BYTES,
                    )

                    if (oversizedFiles.length > 0) {
                      const oversizedNames = oversizedFiles
                        .map((file) => file.name)
                        .slice(0, 3)
                        .join(', ')
                      const suffix = oversizedFiles.length > 3 ? '...' : ''

                      toast.warning(
                        `Cada arquivo deve ter no máximo 10 MB. Arquivos inválidos: ${oversizedNames}${suffix}`,
                      )
                      event.currentTarget.value = ''
                      setSelectedFiles([])
                      return
                    }

                    setSelectedFiles(files)
                  }}
                  className="sr-only"
                />
                {selectedFiles.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    {selectedFiles.length} arquivo(s) selecionado(s).
                  </p>
                )}
                <label
                  htmlFor={fileInputId}
                  className="mt-3 inline-flex cursor-pointer rounded border border-blue-600 px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:bg-blue-50"
                >
                  Selecionar arquivos
                </label>
                <button
                  type="button"
                  onClick={handleUploadAttachments}
                  disabled={isUploadingAttachments || selectedFiles.length === 0}
                  className="mt-3 rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white transition-colors hover:cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  {isUploadingAttachments ? 'Anexando...' : 'Anexar arquivos'}
                </button>
              </div>
            ) : (
              <p className="mb-3 text-xs text-gray-500">
                Apenas o gestor, executor ou administrador pode editar anexos.
              </p>
            )}

            {proposal.attachments && proposal.attachments.length > 0 ? (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
                {proposal.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 whitespace-normal">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.sizeBytes / 1024).toFixed(2)} KB •{' '}
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-3 ml-0">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadAttachment(
                            proposal.id,
                            attachment.id,
                            attachment.originalName,
                          )
                        }
                        className="whitespace-nowrap rounded px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:cursor-pointer hover:bg-blue-50 hover:text-blue-800"
                      >
                        Baixar
                      </button>
                      {canEditAttachments && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(attachment.id)}
                          disabled={isDeletingAttachment && removingAttachmentId === attachment.id}
                          className="whitespace-nowrap rounded px-3 py-1 text-xs font-medium text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 hover:text-red-800 disabled:cursor-not-allowed disabled:text-gray-400"
                        >
                          {isDeletingAttachment && removingAttachmentId === attachment.id
                            ? 'Removendo...'
                            : 'Remover'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Nenhum arquivo anexado.</p>
            )}
          </div>
        </div>
      </Modal>
      <UndoStatusModal
        isOpen={isUndoModalOpen}
        onClose={() => {
          setIsUndoModalOpen(false)
          setSelectedUndoType(null)
        }}
        onConfirm={handleConfirmUndo}
        proposal={proposal}
        undoType={selectedUndoType}
        isLoading={getUndoLoading()}
      />
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <div className="w-full max-w-sm space-y-4 p-6">
          <h3 className="text-lg font-semibold text-red-600">Deletar Proposta</h3>
          <p className="text-gray-700">
            Tem certeza que deseja deletar esta proposta? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isSoftDeleteLoading}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSoftDeleteLoading}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer transition-colors"
            >
              {isSoftDeleteLoading ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isRestoreModalOpen} onClose={() => setIsRestoreModalOpen(false)}>
        <div className="w-full max-w-sm space-y-4 p-6">
          <h3 className="text-lg font-semibold text-green-600">Restaurar Proposta</h3>
          <p className="text-gray-700">
            Tem certeza que deseja restaurar esta proposta? Esta ação não pode ser desfeita.
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setIsRestoreModalOpen(false)}
              disabled={isRestoringLoading}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmRestore}
              disabled={isRestoringLoading}
              className="rounded bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50 hover:cursor-pointer transition-colors"
            >
              {isRestoringLoading ? 'Restaurando...' : 'Restaurar'}
            </button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={isUpdateManagerModalOpen} onClose={() => setIsUpdateManagerModalOpen(false)}>
        <div className="w-full max-w-sm space-y-4 p-6">
          <h3 className="text-lg font-semibold text-blue-600">
            Atualizar {employeeType ? translateRoles(employeeType) : 'Colaborador'}
          </h3>
          <p className="text-gray-700">
            Selecione o novo {employeeType ? translateRoles(employeeType) : 'Colaborador'} para esta
            proposta.
          </p>
          <label htmlFor={`manager-input-${proposal.id}`}>
            <strong>Defina o {employeeType ? translateRoles(employeeType) : 'Colaborador'}</strong>
          </label>
          <EmployeeCombobox
            name={`manager-input-${proposal.id}`}
            listId={`employees-list-${proposal.id}`}
            employees={employeeList || []}
            required
            placeholder="Digite ou selecione o RE"
            onSelect={(value) => {
              setValue('managerOrChampionRe', Number(value), { shouldValidate: true })
            }}
          />
          <input type="hidden" {...register('managerOrChampionRe', { valueAsNumber: true })} />
          {errors.managerOrChampionRe && (
            <p className="text-sm text-red-600">{errors.managerOrChampionRe.message}</p>
          )}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setIsUpdateManagerModalOpen(false)
                setEmployeeType(null)
              }}
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit(handleUpdateProposalManagerOrChampion)}
              className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 hover:cursor-pointer transition-colors"
            >
              Atualizar
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
