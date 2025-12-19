import {useForm, type SubmitHandler} from 'react-hook-form'
import type { CreateEmployee, Employee } from '../../store/employee/types'
import { employeeAPI } from '../../store/employee/employee-api';
import Input from './components/Input';

function Employee () {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<CreateEmployee>()
  const { data } = employeeAPI.useGetEmployeesQuery();
  const [createEmployee, { isLoading, isSuccess, isError }] = employeeAPI.useCreateEmployeeMutation();
  const onSubmit: SubmitHandler<CreateEmployee> = data => createEmployee(data);

  return (
    <>
    <h1 className="font-inter font-light text-3xl bg-gray-300 py-10 pl-10">Colaboradores</h1>
    <div>
      <form 
        className='flex flex-col w-xl m-auto mt-10 p-4 bg-gray-100 rounded-lg shadow-lg' 
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className='flex flex-col'>
          <label>Name:</label>
          <input className="bg-white" type="text" {...register('name')} />
          <label>RE (Matrícula):</label>
          <input className="bg-white" type="text" {...register('re')} />
          <label>Cargo:</label>
          <select className="bg-white" {...register('role')}>
            <option value="OPERATOR">Operator</option>
            <option value="LEADER">Leader</option>
            <option value="ADMIN">Admin</option>
          </select>
          <label>Turno:</label>
          <select className="bg-white" {...register('shift')}>
            <option value="1">1º</option>
            <option value="2">2º</option>
            <option value="3">3º</option>
            <option value="ADM">Administrativo</option>
          </select>
          <label>Senha:</label>
          <input className="bg-white" type="text" {...register('password')} />
          <button className="hover:cursor-pointer bg-blue-500 text-white py-2 px-4 rounded mt-4" type="submit">Submit</button>

        </div>
      </form>
    </div>
    </>
  )
}

export default Employee