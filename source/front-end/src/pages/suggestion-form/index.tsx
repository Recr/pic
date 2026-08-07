import { useState } from 'react'
import type { FormEvent } from 'react'
import logo from '../../assets/logo.png'
import { proposalAPI } from '../../features/proposal/proposal-api'
import { employeeAPI } from '../../features/employee/employee-api'
import { areaAPI } from '../../features/area/area-api'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import EmployeeCombobox from '../../components/inputs/EmployeeCombobox'
import DropdownSelect from '../../components/inputs/DropdownSelect'
import { Skeleton } from '../../components/skeletons/Skeleton'

const EMPLOYEE_OPTIONS = [1, 2, 3] as const

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
}

const SuggestionForm: React.FC = () => {
  const [formKey, setFormKey] = useState(0)
  const [employeeCount, setEmployeeCount] = useState(1)
  const [selectedEmployees, setSelectedEmployees] = useState<
    Record<number, { name: string; shift: string }>
  >({})
  const [selectedAreaId, setSelectedAreaId] = useState('')
  const [areaError, setAreaError] = useState<string | null>(null)
  const [createProposal] = proposalAPI.useCreateProposalMutation()

  const { data: employees = [], isLoading: isLoadingEmployees } = employeeAPI.useGetEmployeesQuery()
  const { data: areas = [], isLoading: isLoadingAreas } = areaAPI.useGetAreasQuery()

  const navigate = useNavigate()

  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const isLoading = isLoadingEmployees || isLoadingAreas

  const handleEmployeeSelect = (num: number, re: string) => {
    const reNumber = Number(re)
    const selectedEmployee = employees.find((emp) => emp.re === reNumber)

    if (selectedEmployee) {
      setSelectedEmployees((prev) => ({
        ...prev,
        [num]: {
          name: selectedEmployee.name,
          shift: selectedEmployee.shift || '',
        },
      }))
      return
    }

    setSelectedEmployees((prev) => {
      return Object.fromEntries(
        Object.entries(prev).filter(([key]) => Number(key) !== num),
      ) as Record<number, { name: string; shift: string }>
    })
  }

  const handleEmployeeFieldChange = (num: number, field: 'name' | 'shift', value: string) => {
    setSelectedEmployees((prev) => {
      const current = prev[num] || { name: '', shift: '' }

      return {
        ...prev,
        [num]: {
          ...current,
          [field]: value,
        },
      }
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const employeeRes = Array.from({ length: employeeCount }, (_, i) =>
      Number(formData.get(`re-${i + 1}`)),
    )

    if (employeeRes.some((re) => Number.isNaN(re))) {
      toast.error('Preencha um RE válido para todos os Colaboradores.', TOAST_OPTIONS)
      return
    }

    const areaId = Number(formData.get('areaId'))

    if (!areaId) {
      setAreaError('Selecione uma área.')
      toast.error('Ah não. Algo deu errado!', TOAST_OPTIONS)
      return
    }

    setAreaError(null)

    const description = String(formData.get('description') ?? '').trim()
    if (!description) {
      toast.error('Preencha a proposta.', TOAST_OPTIONS)
      return
    }

    const employeeInputs = employeeRes.map((re, index) => {
      const employeeNumber = index + 1
      const selectedEmployee = selectedEmployees[employeeNumber]
      const matchedEmployee = employees.find((employee) => employee.re === re)

      return {
        re,
        name: selectedEmployee?.name?.trim() || matchedEmployee?.name || '',
        shift: selectedEmployee?.shift?.trim() || matchedEmployee?.shift || '',
      }
    })

    try {
      await createProposal({
        employees: employeeInputs,
        areaId,
        description,
      }).unwrap()

      toast.success('Proposta enviada. Obrigado!', TOAST_OPTIONS)

      setSelectedEmployees({})
      setSelectedAreaId('')
      setAreaError(null)
      setEmployeeCount(1)
      setFormKey((prev) => prev + 1)
    } catch (error) {
      toast.error('Ah não. Algo deu errado!', TOAST_OPTIONS)
      console.error('Erro ao enviar proposta:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 flex min-h-svh flex-col">
        <div className="flex justify-center flex-col pt-4">
          <div className="flex flex-col items-center">
            <Skeleton className="mb-5 h-48 w-90 max-w-100 rounded-[20px] border-[5px] border-[#ccc]" />
          </div>
          <div className="mx-auto mb-7.5 flex w-90 flex-col items-center rounded-[20px] bg-white px-7.5 py-5 shadow-custom sm:w-auto md:max-w-175">
            <Skeleton className="h-8 w-56" />
            <div
              id="employee_amount_radio"
              className="my-8 mx-auto flex flex-col items-center gap-3"
            >
              <Skeleton className="h-4 w-48" />
              <div className="flex gap-2.5">
                {Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton key={index} className="h-5 w-10 rounded-full" />
                ))}
              </div>
            </div>
            <div className="flex w-full flex-col gap-5 md:flex-row md:justify-center">
              <div className="flex w-full flex-col items-center gap-3 md:min-w-50">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-4/5 rounded-[5px]" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-10 w-4/5 rounded-[5px]" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-4/5 rounded-[5px]" />
              </div>
            </div>
            <div className="mt-7.5 flex w-90 flex-col gap-3">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full rounded-[5px]" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-28 w-full rounded-[5px]" />
              <Skeleton className="h-12 w-full rounded-[5px]" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-100 flex flex-col min-h-svh">
      <ToastContainer />
      {!isLoggedin && (
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-500 text-white font-semibold w-fit rounded-sm absolute top-4 right-4 hover:bg-blue-700 transition-colors hover:cursor-pointer"
        >
          Entrar
        </button>
      )}
      <div className="flex justify-center flex-col pt-4">
        <div className="flex flex-col items-center">
          <img
            id="logo"
            src={logo}
            alt="Logo"
            className="object-contain w-80 sm:w-96 mb-5 border border-[#ccc] rounded"
          />
        </div>
        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="bg-white flex flex-col items-center w-80 sm:w-auto shadow-custom py-5 px-7.5 mx-auto mb-7.5 rounded"
        >
          {/* employee_amount_radio */}
          <div id="employee_amount_radio" className="my-8 mx-auto flex flex-col items-center">
            <label>Quantidade de Colaboradores:</label>
            <div className="flex justify-center gap-2.5">
              {EMPLOYEE_OPTIONS.map((value) => (
                <div key={value} className="flex items-center gap-1">
                  <input
                    type="radio"
                    id={`radio${value}`}
                    name="employeeAmount"
                    value={value}
                    checked={employeeCount === value}
                    onChange={() => setEmployeeCount(value)}
                    required={value === 1}
                    className="cursor-pointer w-5"
                    autoComplete="off"
                  />
                  <label htmlFor={`radio${value}`}>{value}</label>
                </div>
              ))}
            </div>
          </div>
          {/* employee_information */}
          <div
            id="employee_information"
            className="flex flex-col md:flex-row items-center gap-5 w-full mb-7.5 md:max-w-175 md:justify-center"
          >
            {Array.from({ length: employeeCount }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className="employee_block flex flex-col items-center w-full md:min-w-50"
              >
                <h4>Colaborador {num}</h4>
                <label>RE:</label>
                <EmployeeCombobox
                  name={`re-${num}`}
                  listId={`employees-list-${num}`}
                  employees={employees}
                  required
                  onSelect={(value) => handleEmployeeSelect(num, value)}
                  dropdownOverlap={true}
                />
                <label>Nome:</label>
                <input
                  type="text"
                  name={`name-${num}`}
                  value={selectedEmployees[num]?.name || ''}
                  onChange={(e) => handleEmployeeFieldChange(num, 'name', e.target.value)}
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
                  autoComplete="off"
                />
                <label>Turno:</label>
                <input
                  type="text"
                  name={`shift-${num}`}
                  value={selectedEmployees[num]?.shift || ''}
                  onChange={(e) => handleEmployeeFieldChange(num, 'shift', e.target.value)}
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
                  autoComplete="off"
                />
              </div>
            ))}
          </div>
          {/* suggestion_area */}
          <div
            id="suggestion_area"
            className="flex flex-col gap-1.5 justify-center items-center w-65 sm:w-80"
          >
            <DropdownSelect
              label="Local"
              name="areaId"
              value={selectedAreaId}
              onChange={(value) => {
                setSelectedAreaId(value)
                if (value) {
                  setAreaError(null)
                }
              }}
              placeholder="Selecione uma área"
              error={areaError}
              options={areas.map((area) => ({
                value: String(area.id),
                label: area.name,
              }))}
              required
              className="w-4/5"
              buttonClassName="w-full p-2.5 my-1.5 rounded-[5px] border border-[#ccc] bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
              menuClassName="w-full"
            />
          </div>
          <label>Proposta:</label>
          <textarea
            id="description"
            name="description"
            required
            className="resize-none no-underline w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
          ></textarea>
          <button
            type="submit"
            disabled={isLoading}
            className="w-4/5 p-2.5 my-5 rounded-[5px] text-lg border-none bg-blue-600 text-white cursor-pointer transition-all duration-500 hover:bg-blue-950 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar Proposta'}
          </button>
        </form>
      </div>
    </div>
  )
}
export default SuggestionForm
