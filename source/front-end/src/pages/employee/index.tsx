import {useForm, type SubmitHandler} from 'react-hook-form'
import type { Employee } from '../../store/employee/types'

interface EmployeeFormInputs extends Employee {
  password: string;
}

function Employee () {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<EmployeeFormInputs>()
  const onSubmit: SubmitHandler<EmployeeFormInputs> = data => console.log(data)

  console.log(watch('name')) // watch input value by passing the name of it

  return (
    <form className='flex flex-col w-xl m-auto mt-10 bg-gray-100' onSubmit={handleSubmit(onSubmit)}>
      <label>Name:</label>
      <input type="text" {...register('name')} />
      <label>RE (Matrícula):</label>
      <input type="text" {...register('re')} />
      <label>Cargo:</label>
      <select {...register('role')}>
        <option value="OPERATOR">Operator</option>
        <option value="LEADER">Leader</option>
        <option value="ADMIN">Admin</option>
      </select>
      <label>Turno:</label>
      <select {...register('shift')}>
        <option value="1">1º</option>
        <option value="2">2º</option>
        <option value="3">3º</option>
        <option value="ADM">Administrativo</option>
      </select>
      <label>Senha:</label>
      <input type="text" {...register('password')} />
      <input type="submit" />
    </form>
  )
}

export default Employee