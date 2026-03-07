import { useForm, type SubmitHandler } from 'react-hook-form'
import type { CreateEmployee, Employee as EmployeeType } from '../../features/employee/types'
import { employeeAPI } from '../../features/employee/employee-api'
import Input from './components/Input'
import Modal from '../../components/modal/Modal'
import { useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'

const Employee: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateEmployee>()
  const { data } = employeeAPI.useGetEmployeesQuery()
  const [createEmployee, { isLoading, isSuccess, isError }] =
    employeeAPI.useCreateEmployeeMutation()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const onSubmit: SubmitHandler<CreateEmployee> = async (data) => {
    await createEmployee({
      ...data,
      re: Number(data.re),
    })
      .unwrap()
      .then(() => {
        toast('Colaborador cadastrado com sucesso!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
        })
        reset()
        setIsAddModalOpen(false)
      })
      .catch(() => {
        toast('Erro ao cadastrar colaborador.', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
        })
      })
  }
  return (
    <div className="font-inter">
      <ToastContainer />
      <h1 className="font-inter font-light text-3xl bg-gray-300 py-10 pl-10">Colaboradores</h1>
      <div>
        <div className="w-4/5 sm:w-2/3 md:w-1/2 m-auto rounded-lg p-2 flex flex-col gap-2 mt-10">
          {data?.map((employee: EmployeeType) => (
            <div
              key={employee.re}
              className="flex justify-between gap-2 bg-gray-100 px-4 py-2 rounded-lg hover:cursor-pointer hover:bg-blue-200 transition-all"
              onClick={() => setIsEditModalOpen(true)}
            >
              <span>{employee.name}</span>
              <span>{employee.re}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex my-5">
        <button
          className="bg-blue-400 text-white py-2 px-4 rounded-2xl m-auto hover:bg-blue-700 transition-all hover:cursor-pointer"
          onClick={() => setIsAddModalOpen(true)}
        >
          Adicionar Colaborador
        </button>
      </div>
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <div>WIP</div>
      </Modal>
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
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
            <label>RE:</label>
            <input
              className="bg-white px-4 py-1"
              type="text"
              {...register('re')}
              placeholder="RE do operador"
            />
            <label>Cargo:</label>
            <select className="bg-white px-4 py-1" {...register('role')}>
              <option value="OPERATOR">Operador</option>
              <option value="LEADER">Líder</option>
              <option value="ADMIN">Administrador</option>
            </select>
            <label>Turno:</label>
            <select className="bg-white px-4 py-1" {...register('shift')}>
              <option value="1">1º</option>
              <option value="2">2º</option>
              <option value="3">3º</option>
              <option value="ADM">Administrativo</option>
            </select>
            <label>Senha:</label>
            <input
              className="bg-white px-4 py-1"
              type="password"
              {...register('password')}
              placeholder="Senha do operador"
            />
            <button
              className="hover:cursor-pointer hover:bg-blue-700 transition-all bg-blue-500 text-white py-2 px-4 rounded mt-4"
              type="submit"
            >
              Cadastrar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Employee
