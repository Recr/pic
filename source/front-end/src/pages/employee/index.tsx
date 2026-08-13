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
import DropdownSelect from '../../components/inputs/DropdownSelect'

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
  const hasUnregisteredEmployees = Boolean(unregisteredEmployees?.length)
  const createRoleValue = createWatch('role') || 'OPERATOR'
  const createShiftValue = createWatch('shift') || '1'

  const updateRoleValue = updateWatch('role') || 'OPERATOR'
  const updateShiftValue = updateWatch('shift') || '1'

  if (isLoadingEmployees) {
    return (
      <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
        <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
          <Skeleton className="mx-4 my-3 h-8 w-56 sm:my-4 sm:h-9" />
          <div className="mx-4 mt-5 grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 2 }).map((_, columnIndex) => (
              <div key={columnIndex} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <Skeleton className="mb-4 h-6 w-32 rounded-md" />
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((__, rowIndex) => (
                    <Skeleton key={rowIndex} className="h-11 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mx-4 mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <Skeleton className="mb-3 h-6 w-52 rounded-md" />
            {Array.from({ length: 2 }).map((_, index) => (
              <Skeleton key={index} className="mb-3 h-20 w-full rounded-lg bg-gray-200/70" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 px-3 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
      <ToastContainer />
      <div className="mb-7.5 rounded-lg bg-white py-4 shadow-custom sm:py-5">
        <div className="mx-4 my-3 text-left text-xl font-semibold sm:my-4 sm:text-2xl">
          Colaboradores
        </div>

        <div className="mx-4 mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-600">
            <span className="font-medium text-gray-700">{registeredEmployees?.length ?? 0}</span>{' '}
            colaboradores cadastrados
          </p>
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:cursor-pointer hover:bg-blue-700"
            onClick={() => setIsAddModalOpen(true)}
          >
            Adicionar colaborador
          </button>
        </div>

        <div
          className={`mx-4 mt-4 grid gap-4 ${hasUnregisteredEmployees ? 'xl:grid-cols-2' : 'xl:grid-cols-1'}`}
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">Cadastrados</h2>
              <span className="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                {registeredEmployees?.length ?? 0}
              </span>
            </div>
            <div className="max-h-105 overflow-y-auto pr-1">
              <div className="grid grid-cols-[0.75fr_2.5fr_1fr] gap-2 rounded-t-lg bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
                <span>RE</span>
                <span>Nome</span>
                <span>Turno</span>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                {registeredEmployees?.map((employee: EmployeeType) => (
                  <div
                    key={employee.re}
                    className="grid cursor-pointer grid-cols-[0.75fr_2.5fr_1fr] gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50"
                    onClick={() => {
                      setSelectedEmployee(employee)
                      setIsEditModalOpen(true)
                      updateSetValue('name', employee.name)
                      updateSetValue('re', employee.re)
                      updateSetValue('role', employee.role)
                      updateSetValue('shift', employee.shift || '1')
                    }}
                  >
                    <span className="font-medium">{employee.re}</span>
                    <span className="truncate">{employee.name}</span>
                    <span>{employee.shift}</span>
                  </div>
                ))}
                {!registeredEmployees?.length && (
                  <div className="rounded-lg border border-dashed border-gray-300 bg-white px-3 py-8 text-center text-sm text-gray-500">
                    Nenhum colaborador cadastrado.
                  </div>
                )}
              </div>
            </div>
          </div>

          {hasUnregisteredEmployees && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-800">Não cadastrados</h2>
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  {unregisteredEmployees.length}
                </span>
              </div>
              <div className="max-h-105 overflow-y-auto pr-1">
                <div className="grid grid-cols-[0.75fr_2.5fr_1fr] gap-2 rounded-t-lg bg-gray-300 px-3 py-2 text-xs font-semibold text-gray-700">
                  <span>RE</span>
                  <span>Nome</span>
                  <span>Turno</span>
                </div>
                <div className="flex flex-col gap-2 pt-2">
                  {unregisteredEmployees.map((employee: UnregisteredEmployee) => (
                    <div
                      key={employee.employeeRe}
                      className="grid cursor-pointer grid-cols-[0.75fr_2.5fr_1fr] gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 transition-all hover:border-blue-200 hover:bg-blue-50"
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
                      <span className="font-medium">{employee.employeeRe}</span>
                      <span className="truncate">{employee.employeeName}</span>
                      <span>{employee.employeeShift || '1'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {passwordResetRequesters && passwordResetRequesters.length > 0 && (
          <div className="mx-4 mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold text-gray-800">
                Solicitações de recuperação de senha
              </h2>
              <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                {passwordResetRequesters.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {passwordResetRequesters.map((requester: PasswordResetRequester) => (
                <div
                  key={requester.id}
                  className="rounded-lg border border-yellow-200 bg-white px-4 py-3 shadow-sm"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-gray-800">{requester.name}</p>
                      <p className="text-sm text-gray-600">RE: {requester.re}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="mb-1 text-xs font-medium uppercase tracking-wide text-gray-500">
                        Token
                      </p>
                      <p className="inline-flex rounded bg-yellow-100 px-3 py-2 font-mono text-sm font-bold text-yellow-700">
                        {requester.passwordToken}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
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
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
                  buttonClassName="w-full rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:cursor-pointer hover:border-blue-300 hover:bg-blue-50"
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
                  buttonClassName="w-full rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:cursor-pointer hover:border-blue-300 hover:bg-blue-50"
                />
                {updateErrors.shift && (
                  <span className="text-xs text-red-600">{updateErrors.shift.message}</span>
                )}
                <button
                  className="mt-4 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
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
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
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
              buttonClassName="w-full rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:cursor-pointer hover:border-blue-300 hover:bg-blue-50"
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
              buttonClassName="w-full rounded border border-gray-300 bg-white px-3 py-2 text-left text-sm text-gray-700 transition hover:cursor-pointer hover:border-blue-300 hover:bg-blue-50"
            />
            {createErrors.shift && (
              <span className="text-xs text-red-600">{createErrors.shift.message}</span>
            )}
            <label>Senha:</label>
            <input
              className="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              type="password"
              {...createRegister('password')}
              placeholder="Senha do operador"
            />
            {createErrors.password && (
              <span className="text-xs text-red-600">{createErrors.password.message}</span>
            )}
            <button
              className="mt-4 rounded-full bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:cursor-pointer hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
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
