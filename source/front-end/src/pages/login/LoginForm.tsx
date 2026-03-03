import { useForm } from 'react-hook-form'
import { loginSchema } from '../../validation/schemas/login-schemas'
import z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAPI } from '../../features/auth/auth-api'
import { ToastContainer, toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { sleep } from '../../helpers/sleep'
import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'

type LoginFormInput = z.input<typeof loginSchema>
type LoginFormData = z.infer<typeof loginSchema>

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const isAuthInitialized = useSelector((state: RootState) => state.auth.isAuthInitialized)
  const isLoggedIn = user && isAuthInitialized

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  if (isLoggedIn) {
    navigate('/admin/define-champion', { replace: true })
    return null
  }

  const [login] = authAPI.useLoginMutation()

  const onSubmit = async (data: LoginFormData) => {
    try {
      console.log('Submitting login data:', data)
      await login(data).unwrap()
      toast.success('Login realizado com sucesso! Redirecionando...', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
      reset()
      sleep(1000).then(() => {
        navigate('/admin/define-champion', { replace: true })
      })
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Falha no login. Por favor, verifique suas credenciais e tente novamente.')
    }
  }

  const onInvalid = (formErrors: typeof errors) => {
    console.error('Validation failed:', formErrors)
  }

  return (
    <div className="bg-gray-50 h-dvh pt-20">
      <ToastContainer />
      <form
        className="mx-auto flex justify-center flex-col w-xs py-12 bg-white  rounded-lg items-center gap-4 shadow-xl drop-shadow-black"
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        noValidate
      >
        <h2 className="font-bold text-xl text-left w-3xs">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="re" className="text-gray-600 text-xs">
            RE
          </label>
          <input
            type="number"
            id="re"
            className="border-gray-300 border w-3xs p-2 rounded-md [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-moz-number-spin-button]:hidden"
            placeholder="Digite seu RE (Matrícula)"
            {...register('re', { valueAsNumber: true })}
          />
          {errors.re?.message && <p className="text-xs text-red-500 mt-1">{errors.re.message}</p>}
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
            {...register('password')}
          />
          {errors.password?.message && (
            <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
          )}
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
