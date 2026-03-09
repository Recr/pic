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
import EmployeeCombobox from '../../components/EmployeeCombobox'

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
  const [createProposal, { isLoading }] = proposalAPI.useCreateProposalMutation()

  const { data: employees = [] } = employeeAPI.useGetEmployeesQuery()
  const { data: areas = [] } = areaAPI.useGetAreasQuery()

  const navigate = useNavigate()

  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)

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
      toast.error('Preencha um RE válido para todos os funcionários.', TOAST_OPTIONS)
      return
    }

    const areaId = Number(formData.get('areaId'))

    if (!areaId) {
      toast.error('Ah não. Algo deu errado!', TOAST_OPTIONS)
      return
    }

    try {
      await createProposal({
        employeeRes,
        areaId,
        description: formData.get('description') as string,
      }).unwrap()

      toast.success('Sugestão enviada. Obrigado!', TOAST_OPTIONS)

      setSelectedEmployees({})
      setEmployeeCount(1)
      setFormKey((prev) => prev + 1)
    } catch (error) {
      toast.error('Ah não. Algo deu errado!', TOAST_OPTIONS)
      console.error('Erro ao enviar sugestão:', error)
    }
  }

  return (
    <div className="bg-gray-100 flex flex-col">
      <ToastContainer />
      {!isLoggedin && (
        <button
          onClick={() => navigate('/login')}
          className="px-4 py-2 bg-blue-500 text-white font-semibold w-fit rounded-sm ml-auto mr-4 absolute top-4 right-4 hover:bg-blue-700 transition-colors hover:cursor-pointer"
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
            className="object-contain w-90 max-w-[400px] mb-5 border-[5px] border-[#ccc] rounded-[20px]"
          />
        </div>
        <form
          key={formKey}
          onSubmit={handleSubmit}
          className="bg-white flex flex-col items-center w-90 sm:w-auto shadow-custom py-5 px-[30px] mx-auto mb-[30px] rounded-[20px]"
        >
          {/* employee_amount_radio */}
          <div id="employee_amount_radio" className="my-8 mx-auto flex flex-col items-center">
            <label>Quantidade de Funcionários:</label>
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
                  />
                  <label htmlFor={`radio${value}`}>{value}</label>
                </div>
              ))}
            </div>
          </div>
          {/* employee_information */}
          <div
            id="employee_information"
            className="flex flex-col md:flex-row items-center gap-5 w-full mb-[30px] md:max-w-[700px] md:justify-center"
          >
            {Array.from({ length: employeeCount }, (_, i) => i + 1).map((num) => (
              <div
                key={num}
                className="employee_block flex flex-col items-center w-full md:min-w-[200px]"
              >
                <h4>Funcionário {num}</h4>
                <label>RE:</label>
                <EmployeeCombobox
                  name={`re-${num}`}
                  listId={`employees-list-${num}`}
                  employees={employees}
                  required
                  onSelect={(value) => handleEmployeeSelect(num, value)}
                />
                <label>Nome:</label>
                <input
                  type="text"
                  name={`name-${num}`}
                  value={selectedEmployees[num]?.name || ''}
                  onChange={(e) => handleEmployeeFieldChange(num, 'name', e.target.value)}
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
                />
                <label>Turno:</label>
                <input
                  type="text"
                  name={`shift-${num}`}
                  value={selectedEmployees[num]?.shift || ''}
                  onChange={(e) => handleEmployeeFieldChange(num, 'shift', e.target.value)}
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
                />
              </div>
            ))}
          </div>
          {/* suggestion_area */}
          <div
            id="suggestion_area"
            className="flex flex-col gap-1.5 justify-center items-center w-90"
          >
            <label>Local:</label>
            <select
              name="areaId"
              defaultValue=""
              required
              className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc] bg-white"
            >
              <option value="" disabled>
                Selecione uma área
              </option>
              {areas.map((area) => (
                <option key={area.id} value={area.id}>
                  {area.name}
                </option>
              ))}
            </select>
          </div>
          <label>Sugestão:</label>
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
            {isLoading ? 'Enviando...' : 'Enviar Sugestão'}
          </button>
        </form>
      </div>
    </div>
  )
}
export default SuggestionForm
