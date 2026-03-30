import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { ProposalDetailed } from '../../../features/proposal/types'
import { getStatusColor } from '../../../helpers/getStatusColor'

const ProposalItem: React.FC<{ proposal: ProposalDetailed }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  return (
    <>
      <div
        className="text-sm border-t-2 border-gray-200 px-4 py-2 mx-4 grid grid-cols-[56px_2fr_2fr_1fr_1fr_1fr] text-left hover:bg-blue-100 hover:cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <p>{proposal.id}</p>
        <p>
          {proposal.description.length > 45
            ? `${proposal.description.substring(0, 45)}...`
            : proposal.description}
        </p>
        <p>
          {proposal.suggestions
            .map((suggestion) =>
              suggestion.employee ? suggestion.employee.name : suggestion.employeeName,
            )
            .join(', ')
            .substring(0, 45)}
        </p>
        <p>
          {proposal.suggestions
            .map((suggestion) =>
              suggestion.employee ? suggestion.employee.re : suggestion.employeeRe,
            )
            .join(', ')}
        </p>
        <p>{new Date(proposal.createdAt).toLocaleDateString()}</p>
        <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-160 max-w-[95vw] p-6 space-y-5">
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
          {proposal.champion && (
            <div>
              <p className="text-sm font-semibold mb-2">Executor</p>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm">
                  {proposal.champion.name}
                </span>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
