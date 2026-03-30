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
import { useEffect } from 'react'

type LoginFormInput = z.input<typeof loginSchema>
type LoginFormData = z.infer<typeof loginSchema>

const LoginForm: React.FC = () => {
  const navigate = useNavigate()
  const isLoggedin = useSelector((state: RootState) => state.auth.isLoggedin)
  const [login] = authAPI.useLoginMutation()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  useEffect(() => {
    if (isLoggedin) {
      navigate('/admin/define-champion', { replace: true })
    }
  }, [isLoggedin, navigate])

  if (isLoggedin) {
    return null
  }

  const onSubmit = async (data: LoginFormData) => {
    try {
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
      <button
        onClick={() => navigate('/')}
        className="px-4 py-2 bg-blue-500 text-white font-semibold w-fit rounded-sm absolute top-4 left-4 hover:bg-blue-700 transition-colors hover:cursor-pointer"
      >
        Voltar
      </button>
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
            autoComplete={'off'}
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
        <p
          className="text-left mr-auto ml-8 text-sm text-blue-500 hover:underline cursor-pointer -m-2.5"
          onClick={() => navigate('/password-reset')}
        >
          Esqueci a senha.
        </p>
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
