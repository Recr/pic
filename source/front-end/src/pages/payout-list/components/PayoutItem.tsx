import { useState } from 'react'
import StatusBadge from '../../../components/badges/StatusBadge'
import { getStatusColor } from '../../../helpers/getStatusColor'
import type { Payout } from '../../../features/payout/types'
import {
  Banknote,
  CalendarIcon,
  ChevronsRight,
  IdCardIcon,
  Minus,
  Trash2,
  Undo2,
  UserIcon,
} from 'lucide-react'
import Modal from '../../../components/modal/Modal'
import EmployeeInformationBadge from '../../../components/badges/EmployeeInformationBadge'

type PayoutItemProps = {
  payout: Payout
  isSelected: boolean
  onToggleSelect: (id: number) => void
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

const PayoutItem: React.FC<PayoutItemProps> = ({ payout, isSelected, onToggleSelect }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  // const getAvailableUndoActions = () => {
  //   const actions: (typeof selectedUndoType)[] = []

  //   if (
  //     payout.suggestion.proposal.status === 'IMPLEMENTED' &&
  //     !payout.suggestion.proposal.requiresImplementation &&
  //     (isAdmin || isManager)
  //   ) {
  //     actions.push('IMPLEMENTED_TO_WAITING_APPROVAL')
  //   }

  //   if (proposal.status === 'IMPLEMENTED' && (isAdmin || isChampion)) {
  //     actions.push('IMPLEMENTED_TO_IMPLEMENTATION')
  //   }

  //   return actions
  // }

  // const getPrimaryUndoAction = () => {
  //   const actions = getAvailableUndoActions()
  //   return actions.length > 0 ? actions[0] : null
  // }

  // const handleUndoClick = () => {
  //   const undoType = getPrimaryUndoAction()
  //   if (!undoType) {
  //     return
  //   }
  //   setSelectedUndoType(undoType)
  //   setIsUndoModalOpen(true)
  // }

  // const handleConfirmUndo = async () => {
  //   if (!selectedUndoType) {
  //     return
  //   }

  return (
    <>
      <button
        className={`grid grid-cols-1 gap-2 border-gray-200 border-l-8 md:border-l-4  ${borderColors[payout.status] ?? 'border-gray-300'} px-3 py-3 text-sm hover:cursor-pointer hover:bg-blue-100  md:grid-cols-[40px_56px_2fr_2fr_1fr_1fr_1fr_1fr] md:gap-0 md:px-4 md:py-2 hover:translate-y-1 hover:animate-pulse transition-all shadow-lg md:shadow-none rounded-md md:rounded-none`}
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center" onClick={(event) => event.stopPropagation()}>
          {/* TODO: Implement checkbox functionality with shift to select multiple */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onToggleSelect(payout.id)}
            aria-label={`Selecionar payout ${payout.id}`}
            className="w-4 h-4 cursor-pointer"
          />
        </div>
        {/* <p className="font-semibold text-lg md:text-sm flex items-center">
          <span className="md:hidden">#</span>
          {payout.suggestion.proposal.id}
        </p> */}
        <div className="flex justify-between">
          <p className="font-semibold text-lg md:text-sm flex items-center">
            <span className="md:hidden">#</span>
            {payout.suggestion.proposal.id}
          </p>
          <StatusBadge
            status={payout.status}
            color={getStatusColor(payout.status)}
            className="flex md:hidden lg:hidden"
          />
        </div>
        <p className="font-semibold md:font-normal text-md md:text-xs mb-2 md:mb-0 flex items-center md:pr-4">
          {payout.suggestion.proposal.description.length > 50
            ? `${payout.suggestion.proposal.description.substring(0, 50)}...`
            : payout.suggestion.proposal.description}
        </p>
        {/* <p>
          <span className="font-semibold md:hidden">Colaborador: </span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p> */}
        <p className="flex items-center gap-2 text-gray-700 text-xs md:pr-4">
          <UserIcon size={16} className="text-gray-400 md:hidden" />
          {payout.suggestion.employee
            ? payout.suggestion.employee.name
            : payout.suggestion.employeeName}
        </p>
        <div className="flex gap-3 md:hidden">
          <p className="flex items-center gap-2 text-gray-700 text-xs">
            <IdCardIcon size={16} className="text-gray-400" />
            <span>RE</span>
            {payout.suggestion.employee
              ? payout.suggestion.employee.re
              : payout.suggestion.employeeRe}
          </p>
          <p className="flex items-center gap-2 text-gray-700 text-xs">
            <CalendarIcon size={16} className="text-gray-400 md:hidden" />
            {new Date(payout.createdAt).toLocaleDateString()}
          </p>
        </div>
        <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
          <IdCardIcon size={16} className="text-gray-400 md:hidden" />
          <span className="md:hidden">RE</span>
          {payout.suggestion.employee
            ? payout.suggestion.employee.re
            : payout.suggestion.employeeRe}
        </p>
        <p className="items-center text-gray-700 text-xs hidden md:flex md:pr-4">
          <CalendarIcon size={16} className="text-gray-400 md:hidden" />
          {new Date(payout.createdAt).toLocaleDateString()}
        </p>
        <p className="flex items-center gap-2 text-green-600 font-semibold md:text-md md:pr-4 text-xs">
          <Banknote size={16} className="text-green-400 md:hidden" />
          R$ {Number(payout.value).toFixed(2)}
        </p>
        <StatusBadge
          status={payout.status}
          color={getStatusColor(payout.status)}
          className="hidden md:flex lg:flex "
          hasText={false}
        />
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-full sm:max-w-11/12 space-y-4 p-4 md:max-w-[70vw]  sm:p-6 lg:w-152 ">
          <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:gap-4">
            <div>
              <div className="flex gap-2">
                <h2 className="text-xl font-semibold">Proposta #{payout.id}</h2>
                <p
                  className={`${!payout.suggestion.proposal.isLegacy && 'hidden'} bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-600 rounded flex items-center justify-center`}
                >
                  {payout.suggestion.proposal.isLegacy && 'Legado'}
                </p>
              </div>
              <div className="flex gap-4 items-center">
                <p className="text-sm text-gray-600 mt-1">
                  Criada em {new Date(payout.createdAt).toLocaleDateString()}
                </p>
                {payout.suggestion.proposal.completedAt && (
                  <>
                    <div className="flex text-gray-700 -mx-1">
                      <Minus size={20} />
                      <ChevronsRight size={20} className=" -ml-2.5" />
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      Finalizada em{' '}
                      {new Date(payout.suggestion.proposal.completedAt).toLocaleDateString()}
                    </p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* {getPrimaryUndoAction() && (
                <button
                  type="button"
                  onClick={handleUndoClick}
                  title="Desfazer para status anterior"
                  className="inline-flex h-8 w-8 items-center justify-center rounded border border-orange-200 text-orange-600 transition-colors hover:cursor-pointer hover:bg-orange-50"
                >
                  <Undo2 size={16} />
                </button>
              )} */}
              <StatusBadge status={payout.status} color={getStatusColor(payout.status)} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Area</p>
              <p className="font-medium">{payout.suggestion.proposal.area.name}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Categoria</p>
              <p className="font-medium">
                {payout.suggestion.proposal.category?.name
                  ? payout.suggestion.proposal.category.name
                  : 'Nenhuma'}
              </p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Recompensa</p>
              <p className="font-medium text-green-700">
                {payout.suggestion.proposal.category?.categoryReward
                  ? 'R$ ' + Number(payout.suggestion.proposal.category?.categoryReward).toFixed(2)
                  : 'Nenhuma'}
              </p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Descrição</p>
            <p className="text-gray-700 leading-relaxed">
              {payout.suggestion.proposal.description}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Colaborador</p>
            <div className="flex flex-wrap gap-2">
              <EmployeeInformationBadge
                key={`${payout.suggestion.employee?.name || payout.suggestion.employeeName}`}
                suggestion={payout.suggestion}
                id={payout.id}
              />
            </div>
          </div>
          {payout.suggestion.proposal.manager && (
            <div>
              <p className="text-sm font-semibold mb-2">Gestor</p>
              <div className="flex flex-wrap gap-2">
                <div className={`bg-gray-100 px-2 py-1 rounded text-sm transition-colors`}>
                  <span className="text-gray-700 font-bold">
                    {payout.suggestion.proposal.manager.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {payout.suggestion.proposal.manager.re}
                    {' - '}
                    Turno: {payout.suggestion.proposal.manager.shift}
                  </span>
                </div>
              </div>
            </div>
          )}
          {payout.suggestion.proposal.champion && (
            <div>
              <p className="text-sm font-semibold mb-2">Executor</p>
              <div className="flex flex-wrap gap-2">
                <p className={`bg-gray-100 px-2 py-1 rounded text-sm transition-colors`}>
                  <span className="text-gray-700 font-bold">
                    {payout.suggestion.proposal.champion.name}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    {payout.suggestion.proposal.champion.role}
                    {' - '}
                    Turno: {payout.suggestion.proposal.champion.shift}
                  </span>
                </p>
              </div>
            </div>
          )}
          {/* <div>
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
                            payout.suggestion.proposal.id,
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
          </div> */}
        </div>
      </Modal>
    </>
  )
}

export default PayoutItem
