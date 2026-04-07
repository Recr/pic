import { useState } from 'react'
import { Pen, Trash2 } from 'lucide-react'
import { annualTargetAPI } from '../../features/annual-target/annual-target-api'
import Modal from '../../components/modal/Modal'
import AnnualSubmissionAndTarget from './components/AnnualSubmissionAndTarget'
import AnnualImplementationAndTarget from './components/AnnualImplementationAndTarget'
import SubmittedProposalsFiltered from './components/SubmittedProposalsFiltered'

const currentYear = new Date().getFullYear()

const AnalyticsPage: React.FC = () => {
  const [isAnnualTargetModalOpen, setIsAnnualTargetModalOpen] = useState(false)

  const [year, setYear] = useState(currentYear)
  const [annualSubmittedProposalsTarget, setAnnualSubmittedProposalsTarget] = useState(0)
  const [annualImplementedProposalsTarget, setAnnualImplementedProposalsTarget] = useState(0)
  const [annualHeadCount, setAnnualHeadCount] = useState(0)
  const [communicationDaysTarget, setCommunicationDaysTarget] = useState(0)
  const [editingYear, setEditingYear] = useState<number | null>(null)

  const { data: annualTargets } = annualTargetAPI.useGetAnnualTargetsQuery()
  const [createAnnualTarget, { isLoading: isCreatingAnnualTarget }] =
    annualTargetAPI.useCreateAnnualTargetMutation()
  const [updateAnnualTarget, { isLoading: isUpdatingAnnualTarget }] =
    annualTargetAPI.useUpdateAnnualTargetMutation()
  const [deleteAnnualTarget] = annualTargetAPI.useDeleteAnnualTargetMutation()

  const currentYearTarget = annualTargets?.find((target) => target.year === currentYear)

  const resetAnnualTargetForm = () => {
    setYear(currentYear)
    setAnnualSubmittedProposalsTarget(0)
    setAnnualImplementedProposalsTarget(0)
    setAnnualHeadCount(0)
    setCommunicationDaysTarget(0)
    setEditingYear(null)
  }

  const openCreateForm = () => {
    resetAnnualTargetForm()
  }

  const openEditForm = (target: {
    year: number
    annualSubmittedProposalsTarget: number
    annualImplementedProposalsTarget: number
    annualHeadCount: number
    communicationDaysTarget: number
  }) => {
    setEditingYear(target.year)
    setYear(target.year)
    setAnnualSubmittedProposalsTarget(target.annualSubmittedProposalsTarget)
    setAnnualImplementedProposalsTarget(target.annualImplementedProposalsTarget)
    setAnnualHeadCount(target.annualHeadCount)
    setCommunicationDaysTarget(target.communicationDaysTarget)
  }

  const handleAnnualTargetSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      annualSubmittedProposalsTarget,
      annualImplementedProposalsTarget,
      annualHeadCount,
      communicationDaysTarget,
    }

    try {
      if (editingYear !== null) {
        await updateAnnualTarget({ year: editingYear, data: { ...payload, year } }).unwrap()
      } else {
        await createAnnualTarget({ year, ...payload }).unwrap()
      }

      resetAnnualTargetForm()
    } catch (error) {
      console.error('Failed to save annual target:', error)
    }
  }

  const handleDeleteAnnualTarget = async (targetYear: number) => {
    try {
      await deleteAnnualTarget(targetYear).unwrap()

      if (editingYear === targetYear) {
        resetAnnualTargetForm()
      }
    } catch (error) {
      console.error('Failed to delete annual target:', error)
    }
  }

  return (
    <div className="bg-gray-100 pt-8 min-h-screen">
      <div className="mx-auto w-full max-w-7xl rounded bg-white p-4">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Métrica e KPIs do PIC.</p>
        <div className="mt-4 rounded border border-gray-200 bg-gray-50 p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              <p>
                Meta anual de sugestões enviadas:{' '}
                <span className="font-semibold">
                  {currentYearTarget?.annualSubmittedProposalsTarget ?? '-'}
                </span>
              </p>
              <p>
                Meta anual de sugestões implementadas:{' '}
                <span className="font-semibold">
                  {currentYearTarget?.annualImplementedProposalsTarget ?? '-'}
                </span>
              </p>
            </div>
            <button
              type="button"
              className="rounded border border-gray-300 bg-white p-2 text-gray-700 transition-colors hover:cursor-pointer hover:bg-gray-100"
              onClick={() => setIsAnnualTargetModalOpen(true)}
              aria-label="Editar metas anuais"
              title="Editar metas anuais"
            >
              <Pen size={16} />
            </button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <AnnualSubmissionAndTarget />
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 p-4 shadow-sm">
            <AnnualImplementationAndTarget />
          </div>
          <div className="rounded border border-gray-200 bg-gray-50 p-4 shadow-sm lg:col-span-2">
            <SubmittedProposalsFiltered />
          </div>
        </div>
      </div>
      <Modal isOpen={isAnnualTargetModalOpen} onClose={() => setIsAnnualTargetModalOpen(false)}>
        <div className="w-[90vw] max-w-4xl rounded-lg bg-white p-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Metas anuais</h2>
            <button
              type="button"
              onClick={() => setIsAnnualTargetModalOpen(false)}
              className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:cursor-pointer hover:bg-gray-100"
            >
              Fechar
            </button>
          </div>

          <div className="mb-5 overflow-x-auto">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="border-b border-gray-200 px-3 py-2">Ano</th>
                  <th className="border-b border-gray-200 px-3 py-2">Submetidas</th>
                  <th className="border-b border-gray-200 px-3 py-2">Implementadas</th>
                  <th className="border-b border-gray-200 px-3 py-2">N de colaboradores</th>
                  <th className="border-b border-gray-200 px-3 py-2">Dias para Comunicação</th>
                  <th className="border-b border-gray-200 px-3 py-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {annualTargets?.map((target) => (
                  <tr key={target.year}>
                    <td className="border-b border-gray-200 px-3 py-2">{target.year}</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      {target.annualSubmittedProposalsTarget}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      {target.annualImplementedProposalsTarget}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">{target.annualHeadCount}</td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      {target.communicationDaysTarget}
                    </td>
                    <td className="border-b border-gray-200 px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => openEditForm(target)}
                          className="text-blue-600 hover:cursor-pointer hover:text-blue-800"
                          aria-label={`Editar meta do ano ${target.year}`}
                        >
                          <Pen size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteAnnualTarget(target.year)}
                          className="text-red-600 hover:cursor-pointer hover:text-red-800"
                          aria-label={`Remover meta do ano ${target.year}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!annualTargets?.length && (
                  <tr>
                    <td className="px-3 py-4 text-center text-gray-500" colSpan={6}>
                      Nenhuma meta anual cadastrada.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="rounded border border-gray-200 p-4">
            <h3 className="mb-3 text-base font-semibold">
              {editingYear !== null ? `Editar meta ${editingYear}` : 'Criar nova meta'}
            </h3>
            <form
              className="grid grid-cols-1 gap-3 md:grid-cols-3"
              onSubmit={handleAnnualTargetSubmit}
            >
              <div>
                <label className="mb-1 block text-sm" htmlFor="annual-target-year">
                  Ano
                </label>
                <input
                  id="annual-target-year"
                  type="number"
                  min={2000}
                  max={2100}
                  value={year}
                  onChange={(event) => setYear(Number(event.target.value))}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm" htmlFor="annual-submitted-target">
                  Meta anual de sugestões enviadas
                </label>
                <input
                  id="annual-submitted-target"
                  type="number"
                  value={annualSubmittedProposalsTarget}
                  onChange={(event) =>
                    setAnnualSubmittedProposalsTarget(Number(event.target.value))
                  }
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm" htmlFor="annual-implemented-target">
                  Meta anual de sugestões implementadas
                </label>
                <input
                  id="annual-implemented-target"
                  type="number"
                  value={annualImplementedProposalsTarget}
                  onChange={(event) =>
                    setAnnualImplementedProposalsTarget(Number(event.target.value))
                  }
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm" htmlFor="annual-headcount-target">
                  Nº de Colaboradores
                </label>
                <input
                  id="annual-headcount-target"
                  type="number"
                  value={annualHeadCount}
                  onChange={(event) => setAnnualHeadCount(Number(event.target.value))}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm" htmlFor="communication-days-target">
                  Meta de dias para resposta de sugestões
                </label>
                <input
                  id="communication-days-target"
                  type="number"
                  min={1}
                  value={communicationDaysTarget}
                  onChange={(event) => setCommunicationDaysTarget(Number(event.target.value))}
                  required
                  className="w-full rounded border px-3 py-2"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={isCreatingAnnualTarget || isUpdatingAnnualTarget}
                  className="rounded bg-blue-600 px-4 py-2 text-white transition-colors hover:cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
                >
                  {editingYear !== null ? 'Salvar' : 'Criar'}
                </button>
                <button
                  type="button"
                  onClick={openCreateForm}
                  className="rounded border border-gray-300 px-4 py-2 text-gray-700 hover:cursor-pointer hover:bg-gray-100"
                >
                  Limpar
                </button>
              </div>
            </form>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AnalyticsPage
