import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { ProposalDetailed } from '../../../features/proposal/types'
import { getStatusColor } from '../../../helpers/getStatusColor'

const ProposalItem: React.FC<{ proposal: ProposalDetailed }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)

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
          {proposal.attachments && proposal.attachments.length > 0 && (
            <div>
              <p className="text-sm font-semibold mb-2">Arquivos Anexados</p>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-64">
                {proposal.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex flex-col gap-2 rounded border border-gray-200 bg-gray-50 p-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.originalName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(attachment.sizeBytes / 1024).toFixed(2)} KB •{' '}
                        {new Date(attachment.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {/* TODO: Possible Refactor */}
                    <button
                      onClick={() =>
                        handleDownloadAttachment(
                          proposal.id,
                          attachment.id,
                          attachment.originalName,
                        )
                      }
                      className="self-start whitespace-nowrap rounded px-3 py-1 text-xs font-medium text-blue-600 transition-colors hover:cursor-pointer hover:bg-blue-50 hover:text-blue-800 sm:ml-3"
                    >
                      Baixar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
