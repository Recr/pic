import React from 'react'
import Modal from '../../../components/modal/Modal'
import StatusBadge from '../../../components/StatusBadge'
import type { Proposal } from '../../../features/proposal/types'

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
        <StatusBadge status={proposal.status} color="green" />
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-4">Detalhes da Proposta</h2>
          <p>
            <strong>ID:</strong> {proposal.id}
          </p>
          <p>
            <strong>Descrição:</strong> {proposal.description}
          </p>
          <p>
            <strong>Status:</strong> {proposal.status}
          </p>
          <p>
            <strong>Criado em:</strong> {new Date(proposal.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Funcionários:</strong>{' '}
            {proposal.employees.map((employee) => employee.name).join(', ')}
          </p>
        </div>
      </Modal>
    </>
  )
}

export default ProposalItem
