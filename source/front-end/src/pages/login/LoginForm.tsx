import { useForm } from 'react-hook-form'
import { loginSchema } from '../../validation/schemas/login-schemas'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginAPI } from '../../store/auth/login'

const LoginForm: React.FC = () => {
  type createUserFormData = z.infer<typeof loginSchema>
  const { register, handleSubmit, reset } = useForm<createUserFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: createUserFormData) => {
    const loginData = {
      re: parseInt(data.re, 10),
      password: data.password,
    }
    const [ login ] = loginAPI.useLoginMutation()
    try {
      login(login)
    } catch (error) {
      console.error('Login failed:', error)
    }
    const token = 'mocked-token'
    localStorage.setItem('authToken', token)
    reset()
  }

  return (
    <div className="bg-gray-50 h-dvh pt-20">
      <form
        className="mx-auto flex justify-center flex-col w-xs py-12 bg-white  rounded-lg items-center gap-4 shadow-xl drop-shadow-black"
        onSubmit={handleSubmit(onSubmit)}
      >
        <h2 className="font-bold text-xl text-left w-3xs">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="re" className="text-gray-600 text-xs">
            RE
          </label>
          <input
            type="text"
            id="re"
            className="border-gray-300 border w-3xs p-2 rounded-md"
            placeholder="Digite seu RE (Matrícula)"
            required
            {...register('re')}
          />
        </div>
        <div className="flex flex-col">
          <label htmlFor="password" className="text-gray-600 text-xs">
            Senha
          </label>
          <input
            type="password"
            id="password"
            className="border-gray-300 border w-3xs p-2 rounded-md"
            placeholder="Digite sua Senha"
            required
            {...register('password')}
          />
        </div>
        <button
          type="submit"
          className="w-3xs bg-blue-500 text-white hover:bg-blue-800 text-lg font-semibold rounded-md transition-all hover:cursor-pointer hover:animate-pulse py-2 mt-2"
        >
          Entrar
        </button>
      </form>
    </div>
  )
}

export default LoginForm
