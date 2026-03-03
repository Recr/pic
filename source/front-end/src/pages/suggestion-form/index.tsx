import { useState } from 'react'
import type { FormEvent } from 'react'
import logo from '../../assets/logo.png'
import { proposalAPI } from '../../features/proposal/proposal-api'
import { employeeAPI } from '../../features/employee/employee-api'
import { areaAPI } from '../../features/area/area-api'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router'

const SuggestionForm: React.FC = () => {
  const [employeeCount, setEmployeeCount] = useState(1)
  const [selectedEmployees, setSelectedEmployees] = useState<
    Record<number, { name: string; shift: string }>
  >({})
  const [createProposal, { isLoading, isSuccess, isError, reset }] =
    proposalAPI.useCreateProposalMutation()

  const { data: employees = [] } = employeeAPI.useGetEmployeesQuery()
  const { data: areas = [] } = areaAPI.useGetAreasQuery()

  const navigate = useNavigate()

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
    }
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const employeeRes = Array.from({ length: employeeCount }, (_, i) =>
      Number(formData.get(`re-${i + 1}`)),
    )

    const areaName = formData.get('area') as string
    const area = areas.find((a) => a.name === areaName)

    if (!area) return

    try {
      await createProposal({
        employeeRes,
        areaId: area.id,
        description: formData.get('description') as string,
      })
        .unwrap()
        .then(() =>
          toast.success('Sugestão enviada. Obrigado!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
          }),
        )
        .catch(() =>
          toast.error('Ah não. Algo deu errado!', {
            position: 'top-right',
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
          }),
        )

      e.currentTarget.reset()
      setSelectedEmployees({})
    } catch (error) {
      console.error('Erro ao enviar sugestão:', error)
    }
  }

  return (
    <div className="bg-gray-100 flex flex-col">
      <ToastContainer />
      <button
        onClick={() => navigate('/login')}
        className="px-4 py-2 bg-blue-500 text-white font-semibold w-fit rounded-sm ml-auto mr-4 absolute top-4 right-4 hover:bg-blue-700 transition-colors hover:cursor-pointer"
      >
        Entrar
      </button>
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
          onSubmit={handleSubmit}
          className="bg-white flex flex-col items-center w-90 sm:w-auto shadow-custom py-5 px-[30px] mx-auto mb-[30px] rounded-[20px]"
        >
          {/* employee_amount_radio */}
          <div id="employee_amount_radio" className="my-8 mx-auto flex flex-col items-center">
            <label>Quantidade de Funcionários:</label>
            <div className="flex justify-center gap-2.5">
              <input
                type="radio"
                id="radio1"
                name="employeeAmount"
                value="1"
                checked={employeeCount === 1}
                onChange={() => setEmployeeCount(1)}
                required
                className="cursor-pointer w-5"
              />
              <label htmlFor="radio1">1</label>
              <input
                type="radio"
                id="radio2"
                name="employeeAmount"
                value="2"
                checked={employeeCount === 2}
                onChange={() => setEmployeeCount(2)}
                className="cursor-pointer w-5"
              />
              <label htmlFor="radio2">2</label>
              <input
                type="radio"
                id="radio3"
                name="employeeAmount"
                value="3"
                checked={employeeCount === 3}
                onChange={() => setEmployeeCount(3)}
                className="cursor-pointer w-5"
              />
              <label htmlFor="radio3">3</label>
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
                <input
                  type="number"
                  name={`re-${num}`}
                  placeholder="Número de registro"
                  list="employees-list"
                  required
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
                  onChange={(e) => handleEmployeeSelect(num, e.target.value)}
                />
                <datalist id="employees-list">
                  {employees.map((emp) => (
                    <option key={emp.re} value={emp.re}>
                      {emp.name} - {emp.shift}
                    </option>
                  ))}
                </datalist>
                <label>Nome:</label>
                <input
                  type="text"
                  name={`name-${num}`}
                  value={selectedEmployees[num]?.name || ''}
                  readOnly
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc] bg-gray-50"
                />
                <label>Turno:</label>
                <input
                  type="text"
                  name={`shift-${num}`}
                  value={selectedEmployees[num]?.shift || ''}
                  readOnly
                  className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc] bg-gray-50"
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
            <input
              type="text"
              name="area"
              placeholder="Pesquisar área"
              list="areas-list"
              required
              className="w-4/5 p-2.5 my-1.5 rounded-[5px] border border-[#ccc]"
            />
            <datalist id="areas-list">
              {areas.map((area) => (
                <option key={area.id} value={area.name} />
              ))}
            </datalist>
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
