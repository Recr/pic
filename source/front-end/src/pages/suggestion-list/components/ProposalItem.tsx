import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { ProposalDetailed } from '../../../features/proposal/types'
import { proposalAPI } from '../../../features/proposal/proposal-api'
import { getStatusColor } from '../../../helpers/getStatusColor'
import { useSelector } from 'react-redux'
import type { RootState } from '../../../app/store'

const ProposalItem: React.FC<{ proposal: ProposalDetailed }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([])
  const [removingAttachmentId, setRemovingAttachmentId] = React.useState<number | null>(null)

  const [uploadAttachments, { isLoading: isUploadingAttachments }] =
    proposalAPI.useUploadProposalAttachmentsMutation()
  const [deleteAttachment, { isLoading: isDeletingAttachment }] =
    proposalAPI.useDeleteProposalAttachmentMutation()
  const user = useSelector((state: RootState) => state.auth.user)

  const isAdmin = user?.role === 'ADMIN'
  const isManager = user?.re !== undefined && proposal.manager?.re === user.re
  const isChampion = user?.re !== undefined && proposal.champion?.re === user.re
  const canEditAttachments = Boolean(isAdmin || isManager || isChampion)

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
        await response.text()
        // console.error('Download failed with response not ok:', response.status, text)
        // alert(`Erro ao baixar: ${response.status} - ${text}`)
        /* TODO: refactor to use toast */
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
      /* TODO: refactor to use toast */
      console.error('Download error:', error)
      alert(`Erro ao baixar arquivo: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  const handleUploadAttachments = async () => {
    if (selectedFiles.length === 0) {
      alert('Selecione ao menos um arquivo para anexar.')
      return
    }

    try {
      await uploadAttachments({ proposalId: proposal.id, files: selectedFiles }).unwrap()
      setSelectedFiles([])
    } catch (error) {
      alert(
        `Erro ao anexar arquivos: ${error instanceof Error ? error.message : 'falha inesperada'}`,
      )
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
    } catch (error) {
      alert(
        `Erro ao remover arquivo: ${error instanceof Error ? error.message : 'falha inesperada'}`,
      )
    } finally {
      setRemovingAttachmentId(null)
    }
  }

  return (
    <>
      <div
        className="grid grid-cols-1 gap-2 border-t-2 border-gray-200 px-3 py-3 text-left text-sm hover:cursor-pointer hover:bg-blue-100 sm:px-4 md:grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] md:gap-0 md:py-2"
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
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
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
                <input
                  type="file"
                  multiple
                  onChange={(event) => {
                    const fileList = event.target.files
                    setSelectedFiles(fileList ? Array.from(fileList) : [])
                  }}
                  className="w-full text-sm"
                />
                {selectedFiles.length > 0 && (
                  <p className="mt-2 text-xs text-gray-600">
                    {selectedFiles.length} arquivo(s) selecionado(s).
                  </p>
                )}
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
    </>
  )
}

export default ProposalItem
