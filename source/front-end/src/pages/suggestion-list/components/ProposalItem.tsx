import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { ProposalDetailed } from '../../../features/proposal/types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'
import { toast } from 'react-toastify'
import { Undo2, Trash2 } from 'lucide-react'
import UndoStatusModal from './UndoStatusModal'

const MAX_ATTACHMENTS_PER_UPLOAD = 5
const MAX_ATTACHMENT_SIZE_BYTES = 10 * 1024 * 1024

const ProposalItem: React.FC<{ proposal: ProposalDetailed }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [isUndoModalOpen, setIsUndoModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [removingAttachmentId, setRemovingAttachmentId] = React.useState<number | null>(null)
  const [selectedUndoType, setSelectedUndoType] = React.useState<
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
  const user = useSelector((state: RootState) => state.auth.user)

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.re !== undefined && proposal.manager?.re === user.re
  const isChampion = user?.re !== undefined && proposal.champion?.re === user.re
  const canEditAttachments = Boolean(isAdmin || isManager || isChampion)
  const fileInputId = `attachment-input-${proposal.id}`

  const getUndoLoading = () => {
    switch (selectedUndoType) {
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

  const getAvailableUndoActions = () => {
    const actions: (typeof selectedUndoType)[] = []

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

  const handleSoftDelete = () => {
    setIsDeleteModalOpen(true)
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

      const response = await fetch(
        `/api/proposals/${proposalId}/attachments/${attachmentId}/download`,
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            Accept: 'application/octet-stream',
          },
        },
      )

      // console.log('Response received:', {
      //   status: response.status,
      //   statusText: response.statusText,
      //   contentType: response.headers.get('content-type'),
      //   contentLength: response.headers.get('content-length'),
      // })
      {
        /* TODO: refactor to use toast */
      }
      if (!response.ok) {
        const errorText = await response.text()
        toast.error(`Erro ao baixar arquivo (${response.status}): ${errorText || 'Falha.'}`)
        return
      }

      const blob = await response.blob()
      console.log('Blob received:', { size: blob.size, type: blob.type })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      // console.log('Download triggered successfully')
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

  return (
    <>
      <div
        className="grid grid-cols-1 gap-2 border-t-2 border-gray-200 px-3 py-3 text-left text-sm hover:cursor-pointer hover:bg-blue-100 sm:px-4 md:grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] md:gap-0 md:py-2 transition-all"
        onClick={() => setIsModalOpen(true)}
      >
        <p>
          <span className="font-semibold md:hidden">ID: </span>
          {proposal.id}
        </p>
        <p>
          <span className="font-semibold md:hidden">Proposta: </span>
          {proposal.description.length > 45
            ? `${proposal.description.substring(0, 45)}...`
            : proposal.description}
        </p>
        <p>
          <span className="font-semibold md:hidden">Funcionários: </span>
          {proposal.suggestions
            .map((suggestion) =>
              suggestion.employee ? suggestion.employee.name : suggestion.employeeName,
            )
            .join(', ')
            .substring(0, 45)}
        </p>
        <p>
          <span className="font-semibold md:hidden">RE: </span>
          {proposal.suggestions
            .map((suggestion) =>
              suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
            )
            .join(', ')}
        </p>
        <p>
          <span className="font-semibold md:hidden">Criado em: </span>
          {new Date(proposal.createdAt).toLocaleDateString()}
        </p>
        <div>
          <span className="font-semibold md:hidden">Status: </span>
          <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full max-w-[95vw] space-y-4 p-4 sm:max-w-[90vw] sm:p-6 lg:w-152">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
            <div>
              <h2 className="text-xl font-semibold">Proposta #{proposal.id}</h2>
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
              {isAdmin && (
                <button
                  type="button"
                  onClick={handleSoftDelete}
                  disabled={isSoftDeleteLoading}
                  title="Deletar proposta"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-red-200 text-red-600 transition-colors hover:cursor-pointer hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  <Trash2 size={16} />
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
          {proposal.manager && (
            <div>
              <p className="text-sm font-semibold mb-2">Gestor</p>
              <div className="flex flex-wrap gap-2">
                <p className="bg-gray-100 px-2 py-1 rounded text-sm">
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
                <p className="bg-gray-100 px-2 py-1 rounded text-sm">
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
                      <p className="truncate text-sm font-medium text-gray-900">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.sizeBytes / 1024).toFixed(2)} KB •{' '}
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 sm:ml-3">
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
              className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={isSoftDeleteLoading}
              className="rounded bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSoftDeleteLoading ? 'Deletando...' : 'Deletar'}
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
