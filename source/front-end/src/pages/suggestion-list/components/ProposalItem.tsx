import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { Proposal } from '../../../features/proposal/types'
import { translateStatus } from '../../../helpers/translateStatus'
import { getStatusColor } from '../../../helpers/getStatusColor'

const ProposalItem: React.FC<{ proposal: Proposal }> = ({ proposal }) => {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  return (
    <>
      <div
        className="border-t-2 border-gray-200 px-4 py-2 mx-4 grid grid-cols-[56px_2fr_2fr_1fr_1fr] text-left hover:bg-blue-100 hover:cursor-pointer"
        onClick={() => setIsModalOpen(true)}
      >
        <p>{proposal.id}</p>
        <p>{proposal.description}</p>
        <p>{proposal.employees.map((employee) => employee.name).join(', ')}</p>
        <p>{new Date(proposal.createdAt).toLocaleDateString()}</p>
        <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="w-[640px] max-w-[95vw] p-6 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Detalhes da Proposta</h2>
              <p className="text-sm text-gray-600 mt-1">
                Criado em {new Date(proposal.createdAt).toLocaleDateString()}
              </p>
            </div>
            <StatusBadge status={proposal.status} color={getStatusColor(proposal.status)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">ID</p>
              <p className="font-medium">#{proposal.id}</p>
            </div>
            <div className="bg-gray-50 rounded p-3">
              <p className="text-xs text-gray-500">Status</p>
              <p className="font-medium">{translateStatus(proposal.status)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold mb-1">Descrição</p>
            <p className="text-gray-700 leading-relaxed">{proposal.description}</p>
          </div>

          <div>
            <p className="text-sm font-semibold mb-2">Funcionários</p>
            <div className="flex flex-wrap gap-2">
              {proposal.employees.map((employee, index) => (
                <span
                  key={`${proposal.id}-${employee.name}-${index}`}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-sm"
                >
                  {employee.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
