import { useForm, type SubmitHandler } from 'react-hook-form'
import type {
  Employee as EmployeeType,
  UnregisteredEmployee,
  PasswordResetRequester,
} from '../../features/employee/types'
import { employeeAPI } from '../../features/employee/employee-api'
import Modal from '../../components/modal/Modal'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from '../../validation/schemas/employee-schemas'
import type z from 'zod'
import { Skeleton } from '../../components/skeletons/Skeleton'
import DropdownSelect from '../../components/DropdownSelect'

const Employee: React.FC = () => {
  type CreateEmployeeSchemaInput = z.input<typeof createEmployeeSchema>
  type CreateEmployeeSchemaOutput = z.output<typeof createEmployeeSchema>
  const {
    register: createRegister,
    handleSubmit: createHandleSubmit,
    reset: createReset,
    setValue: createSetValue,
    watch: createWatch,
    formState: { errors: createErrors },
  } = useForm<CreateEmployeeSchemaInput, undefined, CreateEmployeeSchemaOutput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      role: 'OPERATOR',
    },
  })

  type UpdateEmployeeSchemaInput = z.input<typeof updateEmployeeSchema>
  type UpdateEmployeeSchemaOutput = z.output<typeof updateEmployeeSchema>
  const {
    register: updateRegister,
    handleSubmit: updateHandleSubmit,
    reset: updateReset,
    setValue: updateSetValue,
    watch: updateWatch,
    formState: { errors: updateErrors },
  } = useForm<UpdateEmployeeSchemaInput, undefined, UpdateEmployeeSchemaOutput>({
    resolver: zodResolver(updateEmployeeSchema),
    defaultValues: {
      role: 'OPERATOR',
    },
  })

  const { data: registeredEmployees, isLoading: isLoadingRegisteredEmployees } =
    employeeAPI.useGetEmployeesQuery()
  const { data: unregisteredEmployees, isLoading: isLoadingUnregisteredEmployees } =
    employeeAPI.useGetUnregisteredEmployeesQuery()
  const { data: passwordResetRequesters, isLoading: isLoadingPasswordResetRequesters } =
    employeeAPI.useGetPasswordResetRequestersQuery()
  const [createEmployee, { isLoading }] = employeeAPI.useCreateEmployeeMutation()
  const [updateEmployee, { isLoading: isUpdating }] = employeeAPI.useUpdateEmployeeMutation()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeType | null>(null)
  const [selectedUnregisteredEmployee, setSelectedUnregisteredEmployee] =
    useState<UnregisteredEmployee | null>(null)

  const createOnSubmit: SubmitHandler<CreateEmployeeSchemaOutput> = async (data) => {
    try {
      await createEmployee(data).unwrap()
      toast('Colaborador cadastrado com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
      createReset()
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

  const updateOnSubmit: SubmitHandler<UpdateEmployeeSchemaOutput> = async (data) => {
    try {
      if (!selectedEmployee) return
      await updateEmployee({ id: selectedEmployee?.id, ...data }).unwrap()
      toast('Colaborador atualizado com sucesso!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
      updateReset()
      setIsEditModalOpen(false)
    } catch {
      toast('Nao foi possivel atualizar o colaborador.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
    }
  }

  const isLoadingEmployees =
    isLoadingRegisteredEmployees ||
    isLoadingUnregisteredEmployees ||
    isLoadingPasswordResetRequesters
  const createRoleValue = createWatch('role') || 'OPERATOR'
  const createShiftValue = createWatch('shift') || '1'

  const updateRoleValue = updateWatch('role') || 'OPERATOR'
  const updateShiftValue = updateWatch('shift') || '1'

  if (isLoadingEmployees) {
    return (
      <div className="font-inter bg-gray-100 min-h-screen p-5">
        <div className="bg-white rounded-xl m-auto p-8 lg:w-4xl">
          <Skeleton className="mx-auto h-8 w-56" />
          <div className="mt-8 flex flex-col gap-4 md:flex-row justify-center">
            {Array.from({ length: 2 }).map((_, columnIndex) => (
              <div key={columnIndex} className="md:w-sm rounded-lg p-5 shadow-lg">
                <Skeleton className="mx-auto h-7 w-40" />
                <div className="mt-6 flex flex-col gap-2">
                  {Array.from({ length: 5 }).map((__, rowIndex) => (
                    <Skeleton key={rowIndex} className="h-12 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="my-5 flex">
            <Skeleton className="mx-auto h-10 w-56 rounded-2xl" />
          </div>
        </div>
        <div className="mt-8 mb-8">
          <Skeleton className="mx-auto h-8 w-80" />
          <div className="mx-auto mt-4 flex max-w-2xl flex-col gap-3 rounded-lg bg-yellow-50 p-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full rounded-lg bg-gray-200/70" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="font-inter bg-gray-100 min-h-screen p-5">
      <ToastContainer />
      <div className="bg-white rounded-xl m-auto p-8 w-fit">
        <h1 className="font-inter font-light text-3xl py-10 pl-10">Colaboradores</h1>
        <div className="flex flex-col md:flex-row justify-center gap-4">
          <div className="md:w-sm shadow-lg rounded-lg p-5">
            <h2 className="font-inter font-light text-2xl py-10 text-center">Cadastrados</h2>
            <div className="m-auto rounded-lg p-2 flex flex-col gap-2 max-h-100 overflow-y-auto">
              {registeredEmployees?.map((employee: EmployeeType) => (
                <div
                  key={employee.re}
                  className="flex justify-between gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-200 transition-all"
                  onClick={() => {
                    setSelectedEmployee(employee)
                    setIsEditModalOpen(true)
                    updateSetValue('name', employee.name)
                    updateSetValue('re', employee.re)
                    updateSetValue('role', employee.role)
                    updateSetValue('shift', employee.shift || '1')
                  }}
                >
                  <span>{employee.name}</span>
                  <span>{employee.re}</span>
                </div>
              ))}
            </div>
          </div>
          {unregisteredEmployees && unregisteredEmployees.length > 0 && (
            <div className="md:w-sm shadow-lg rounded-lg p-5 hover:">
              <h2 className="font-inter font-light text-2xl py-10 text-center">Não Cadastrados</h2>
              <div className="m-auto rounded-lg p-2 flex flex-col gap-2 max-h-100 overflow-y-auto">
                {unregisteredEmployees.length > 0 &&
                  unregisteredEmployees.map((employee: UnregisteredEmployee) => (
                    <div
                      key={employee.employeeRe}
                      className="flex justify-between gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-200 transition-all"
                      onClick={() => {
                        setSelectedUnregisteredEmployee(employee)
                        setIsAddModalOpen(true)
                        createSetValue('name', employee.employeeName)
                        createSetValue('re', employee.employeeRe)
                        createSetValue(
                          'shift',
                          employee.employeeShift ? employee.employeeShift : 'ADM',
                        )
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
        <div className="flex my-5">
          <button
            className="bg-blue-400 text-white py-2 px-4 rounded-2xl m-auto hover:bg-blue-700 transition-all hover:cursor-pointer"
            onClick={() => setIsAddModalOpen(true)}
          >
            Adicionar Colaborador
          </button>
        </div>
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
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setSelectedEmployee(null)
          updateReset()
        }}
      >
        <div className="rounded-xl bg-whites p-1 gap-4 flex flex-col w-2xs">
          {/* <X
            className="hover:cursor-pointer size-4 hover:size-6 "
            onClick={() => setIsEditModalOpen(false)}
          /> */}
          <h2 className="text-center">Editar Colaborador</h2>
          {selectedEmployee ? (
            <form
              className="flex flex-col  mt-5 p-2 rounded-lg"
              onSubmit={updateHandleSubmit(updateOnSubmit)}
            >
              <div className="flex flex-col gap-2 text-sm">
                <label>Nome:</label>
                <input
                  className="bg-white px-4 py-1"
                  type="text"
                  {...updateRegister('name')}
                  placeholder="Nome completo do operador"
                  autoComplete="off"
                />
                {updateErrors.name && (
                  <span className="text-xs text-red-600">{updateErrors.name.message}</span>
                )}
                <label>RE:</label>
                <input
                  className="bg-white px-4 py-1"
                  type="number"
                  {...updateRegister('re')}
                  placeholder="RE do operador"
                  min={0}
                  max={50000}
                  autoComplete="off"
                />
                {updateErrors.re && (
                  <span className="text-xs text-red-600">{updateErrors.re.message}</span>
                )}
                <DropdownSelect
                  label="Cargo"
                  value={updateRoleValue}
                  onChange={(value) =>
                    updateSetValue('role', value as UpdateEmployeeSchemaInput['role'])
                  }
                  placeholder="Selecione um cargo"
                  options={[
                    { value: 'OPERATOR', label: 'Operador' },
                    { value: 'TEAM_LEADER', label: 'Team Leader' },
                    { value: 'SUPERVISOR', label: 'Supervisor' },
                    { value: 'MANAGER', label: 'Gerente' },
                    { value: 'GENERAL_MANAGER', label: 'Gerente Geral (GM)' },
                    { value: 'HUMAN_RESOURCES', label: 'Recursos Humanos (RH)' },
                    { value: 'TECHNICAL_SUPPORT', label: 'Suporte Técnico' },
                    { value: 'ADMIN', label: 'Administrador' },
                  ]}
                  showEmptyOption={false}
                  buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
                />
                {updateErrors.role && (
                  <span className="text-xs text-red-600">{updateErrors.role.message}</span>
                )}
                <DropdownSelect
                  label="Turno"
                  value={updateShiftValue}
                  onChange={(value) =>
                    updateSetValue('shift', value as UpdateEmployeeSchemaInput['shift'])
                  }
                  placeholder="Selecione um turno"
                  options={[
                    { value: '1', label: '1º' },
                    { value: '2', label: '2º' },
                    { value: '3', label: '3º' },
                    { value: 'ADM', label: 'Administrativo' },
                  ]}
                  showEmptyOption={false}
                  buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
                />
                {updateErrors.shift && (
                  <span className="text-xs text-red-600">{updateErrors.shift.message}</span>
                )}
                <button
                  className="hover:cursor-pointer hover:bg-blue-700 transition-all bg-blue-500 text-white py-2 px-4 rounded mt-4"
                  type="submit"
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Atualizando...' : 'Atualizar'}
                </button>
              </div>
            </form>
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
            createReset()
          }
        }}
      >
        <h2 className="text-center">Adicionar Colaborador</h2>
        <form
          className="flex flex-col m-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-lg"
          onSubmit={createHandleSubmit(createOnSubmit)}
        >
          <div className="flex flex-col gap-2 text-sm">
            <label>Nome:</label>
            <input
              className="bg-white px-4 py-1"
              type="text"
              {...createRegister('name')}
              placeholder="Nome completo do operador"
              autoComplete="off"
            />
            {createErrors.name && (
              <span className="text-xs text-red-600">{createErrors.name.message}</span>
            )}
            <label>RE:</label>
            <input
              className="bg-white px-4 py-1"
              type="number"
              {...createRegister('re')}
              placeholder="RE do operador"
              min={0}
              max={50000}
              autoComplete="off"
            />
            {createErrors.re && (
              <span className="text-xs text-red-600">{createErrors.re.message}</span>
            )}
            <DropdownSelect
              label="Cargo"
              value={createRoleValue}
              onChange={(value) =>
                createSetValue('role', value as CreateEmployeeSchemaInput['role'])
              }
              placeholder="Selecione um cargo"
              options={[
                { value: 'OPERATOR', label: 'Operador' },
                { value: 'TEAM_LEADER', label: 'Team Leader' },
                { value: 'SUPERVISOR', label: 'Supervisor' },
                { value: 'MANAGER', label: 'Gerente' },
                { value: 'GENERAL_MANAGER', label: 'Gerente Geral (GM)' },
                { value: 'HUMAN_RESOURCES', label: 'Recursos Humanos (RH)' },
                { value: 'TECHNICAL_SUPPORT', label: 'Suporte Técnico' },
                { value: 'ADMIN', label: 'Administrador' },
              ]}
              showEmptyOption={false}
              buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
            />
            {createErrors.role && (
              <span className="text-xs text-red-600">{createErrors.role.message}</span>
            )}
            <DropdownSelect
              label="Turno"
              value={createShiftValue}
              onChange={(value) =>
                createSetValue('shift', value as CreateEmployeeSchemaInput['shift'])
              }
              placeholder="Selecione um turno"
              options={[
                { value: '1', label: '1º' },
                { value: '2', label: '2º' },
                { value: '3', label: '3º' },
                { value: 'ADM', label: 'Administrativo' },
              ]}
              showEmptyOption={false}
              buttonClassName="p-2.5 w-full border border-[#ccc] rounded bg-white hover:cursor-pointer hover:bg-blue-100 transition-colors"
            />
            {createErrors.shift && (
              <span className="text-xs text-red-600">{createErrors.shift.message}</span>
            )}
            <label>Senha:</label>
            <input
              className="bg-white px-4 py-1"
              type="password"
              {...createRegister('password')}
              placeholder="Senha do operador"
            />
            {createErrors.password && (
              <span className="text-xs text-red-600">{createErrors.password.message}</span>
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
