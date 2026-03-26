import { useForm, type SubmitHandler } from 'react-hook-form'
import type { Employee as EmployeeType, UnregisteredEmployee, PasswordResetRequester } from '../../features/employee/types'
import { employeeAPI } from '../../features/employee/employee-api'
import Modal from '../../components/modal/Modal'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { zodResolver } from '@hookform/resolvers/zod'
import { createEmployeeSchema } from '../../validation/schemas/employee-schemas'
import { translateRoles } from '../../helpers/translateRoles'
import type z from 'zod'

const Employee: React.FC = () => {
  type CreateEmployeeSchemaInput = z.input<typeof createEmployeeSchema>
  type CreateEmployeeSchemaOutput = z.output<typeof createEmployeeSchema>
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateEmployeeSchemaInput, undefined, CreateEmployeeSchemaOutput>({
    resolver: zodResolver(createEmployeeSchema),
  })
  const { data: registeredEmployees } = employeeAPI.useGetEmployeesQuery()
  const { data: unregisteredEmployees } = employeeAPI.useGetUnregisteredEmployeesQuery()
  const { data: passwordResetRequesters } = employeeAPI.useGetPasswordResetRequestersQuery()
  const [createEmployee, { isLoading }] = employeeAPI.useCreateEmployeeMutation()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null)
  const [selectedUnregisteredEmployee, setSelectedUnregisteredEmployee] =
    useState<UnregisteredEmployee | null>(null)

  const formatShift = (shift?: string) => {
    const shiftMap: Record<string, string> = {
      '1': '1º turno',
      '2': '2º turno',
      '3': '3º turno',
      ADM: 'Administrativo',
    }

    if (!shift) {
      return 'Nao informado'
    }

    return shiftMap[shift] || shift
  }

  const onSubmit: SubmitHandler<CreateEmployeeSchemaOutput> = async (data) => {
    try {
      await createEmployee(data).unwrap()
      toast('Colaborador cadastrado com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
      reset()
      setIsAddModalOpen(false)
    } catch {
      toast('Nao foi possivel cadastrar o colaborador.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
    }
  }
  return (
    <div className="font-inter">
      <ToastContainer />
      <h1 className="font-inter font-light text-3xl bg-gray-300 py-10 pl-10">Colaboradores</h1>
      <div className="flex justify-evenly">
        <div className="w-sm">
          <h2 className="font-inter font-light text-2xl py-10 text-center">
            Colaboradores Cadastrados
          </h2>
          <div className="m-auto rounded-lg p-2 flex flex-col gap-2">
            {registeredEmployees?.map((employee: EmployeeType) => (
              <div
                key={employee.re}
                className="flex justify-between gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-200 transition-all"
                onClick={() => {
                  setSelectedEmployee(employee)
                  setIsEditModalOpen(true)
                }}
              >
                <span>{employee.name}</span>
                <span>{employee.re}</span>
              </div>
            ))}
          </div>
        </div>
        {unregisteredEmployees && unregisteredEmployees.length > 0 && (
          <div className="w-sm">
            <h2 className="font-inter font-light text-2xl py-10 text-center">
              Colaboradores Nao Cadastrados
            </h2>
            <div className="m-auto rounded-lg p-2 flex flex-col gap-2">
              {unregisteredEmployees?.map((employee: UnregisteredEmployee) => (
                <div
                  key={employee.employeeRe}
                  className="flex justify-between gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-200 transition-all"
                  onClick={() => {
                    setSelectedUnregisteredEmployee(employee)
                    setIsAddModalOpen(true)
                    setValue('name', employee.employeeName)
                    setValue('re', employee.employeeRe)
                    setValue('shift', employee.employeeShift ? employee.employeeShift : 'ADM')
                  }}
                >
                  <span>{employee.employeeName}</span>
                  <span>{employee.employeeRe}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {passwordResetRequesters && passwordResetRequesters.length > 0 && (
        <div className="mt-8 mb-8">
          <h2 className="font-inter font-light text-2xl py-10 text-center">
            Solicitações de Recuperação de Senha
          </h2>
          <div className="max-w-2xl mx-auto rounded-lg p-4 bg-yellow-50">
            <div className="flex flex-col gap-3">
              {passwordResetRequesters.map((requester: PasswordResetRequester) => (
                <div
                  key={requester.id}
                  className="bg-white px-4 py-3 rounded-lg border-l-4 border-yellow-400 shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{requester.name}</p>
                      <p className="text-sm text-gray-600">RE: {requester.re}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-1">Token de Recuperação:</p>
                      <p className="font-mono text-lg font-bold text-yellow-600 bg-yellow-100 px-3 py-2 rounded">
                        {requester.passwordToken}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex my-5">
        <button
          className="bg-blue-400 text-white py-2 px-4 rounded-2xl m-auto hover:bg-blue-700 transition-all hover:cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          Adicionar Colaborador
        </button>
      </div>
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEmployee(null)
        }}
      >
        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
          <h2 className="text-center text-xl font-semibold text-gray-800">Dados do colaborador</h2>
          {selectedEmployee ? (
            <div className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-sm text-gray-600">Nome</span>
                <span className="font-medium text-gray-900">{selectedEmployee.name}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-sm text-gray-600">RE</span>
                <span className="font-medium text-gray-900">{selectedEmployee.re}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                <span className="text-sm text-gray-600">Cargo</span>
                <span className="font-medium text-gray-900">
                  {translateRoles(selectedEmployee.role)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Turno</span>
                <span className="font-medium text-gray-900">
                  {formatShift(selectedEmployee.shift)}
                </span>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-center text-sm text-gray-500">
              Nenhum colaborador selecionado.
            </p>
          )}
        </div>
      </Modal>
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false)
          if (selectedUnregisteredEmployee != null) {
            setSelectedUnregisteredEmployee(null)
            reset()
          }
        }}
      >
        <h2 className="text-center">Adicionar Colaborador</h2>
        <form
          className="flex flex-col m-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-2 text-sm">
            <label>Nome:</label>
            <input
              className="bg-white px-4 py-1"
              type="text"
              {...register('name')}
              placeholder="Nome completo do operador"
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
            <label>RE:</label>
            <input
              className="bg-white px-4 py-1"
              type="number"
              {...register('re')}
              placeholder="RE do operador"
              min={0}
              max={50000}
            />
            {errors.re && <span className="text-xs text-red-600">{errors.re.message}</span>}
            <label>Cargo:</label>
            <select className="bg-white px-4 py-1" {...register('role')}>
              <option value="OPERATOR">Operador</option>
              <option value="TEAM_LEADER">Team Leader</option>
              <option value="SUPERVISOR">Supervisor</option>
              <option value="MANAGER">Gerente</option>
              <option value="GENERAL_MANAGER">Gerente Geral (GM)</option>
              <option value="HUMAN_RESOURCES">Recursos Humanos (RH)</option>
              <option value="TECHNICAL_SUPPORT">Suporte Técnico</option>
              <option value="ADMIN">Administrador</option>
            </select>
            {errors.role && <span className="text-xs text-red-600">{errors.role.message}</span>}
            <label>Turno:</label>
            <select className="bg-white px-4 py-1" {...register('shift')}>
              <option value="1">1º</option>
              <option value="2">2º</option>
              <option value="3">3º</option>
              <option value="ADM">Administrativo</option>
            </select>
            {errors.shift && <span className="text-xs text-red-600">{errors.shift.message}</span>}
            <label>Senha:</label>
            <input
              className="bg-white px-4 py-1"
              type="password"
              {...register('password')}
              placeholder="Senha do operador"
            />
            {errors.password && (
              <span className="text-xs text-red-600">{errors.password.message}</span>
            )}
            <button
              className="hover:cursor-pointer hover:bg-blue-700 transition-all bg-blue-500 text-white py-2 px-4 rounded mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Cadastrando...' : 'Cadastrar'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Employee
