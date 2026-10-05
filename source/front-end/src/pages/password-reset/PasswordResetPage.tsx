import { useForm } from 'react-hook-form'
import { resetPasswordSchema } from '../../validation/schemas/login-schemas'
import { zodResolver } from '@hookform/resolvers/zod/src/zod.js'
import type z from 'zod'
import { toast } from 'react-toastify/unstyled'
import { authAPI } from '../../features/auth/auth-api'
import { useState } from 'react'
import Modal from '../../components/modal/Modal'
import RequestTokenForm from './components/RequestTokenForm'
import { useNavigate } from 'react-router'

type ResetPasswordFormValues = z.input<typeof resetPasswordSchema>
type ResetPasswordPayload = z.output<typeof resetPasswordSchema>

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
}
const PasswordResetPage: React.FC = () => {
  const [resetPassword] = authAPI.useResetPasswordMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ResetPasswordFormValues, unknown, ResetPasswordPayload>({
    resolver: zodResolver(resetPasswordSchema),
  })

  const onSubmit = async (data: ResetPasswordPayload) => {
    try {
      await resetPassword(data).unwrap()
      reset()
      toast.success('Senha alterada com sucesso!', TOAST_OPTIONS)
    } catch (error) {
      toast.error(
        'Erro ao alterar senha. Verifique suas credenciais e tente novamente.',
        TOAST_OPTIONS,
      )
      console.error('Failed to change password:', error)
    }
  }
  return (
    <div className="bg-gray-100 h-screen">
      <button
        onClick={() => navigate('/login')}
        className="px-4 py-2 bg-blue-500 text-white font-semibold w-fit rounded-sm absolute top-4 left-4 hover:bg-blue-700 transition-colors hover:cursor-pointer"
      >
        Voltar
      </button>
      <div className="w-xs mx-auto p-5 bg-white rounded-2xl shadow-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Recuperação de senha
          </h1>
          <div className="w-full">
            <label htmlFor="re">RE: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              id="re"
              placeholder="Digite seu RE (Matrícula)"
              {...register('re')}
            />
          </div>
          <span className="text-sm text-red-600">{errors.re?.message}</span>

          <div className="w-full">
            <label htmlFor="passwordToken">Token de seis digitos: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              id="passwordToken"
              placeholder="Digite o token de seis dígitos"
              {...register('passwordToken')}
            />
            <span className="text-sm text-red-600">{errors.passwordToken?.message}</span>
          </div>
          <div className="w-full">
            <label htmlFor="newPassword">Nova Senha: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="newPassword"
              placeholder="Digite a nova senha"
              {...register('newPassword')}
            />
            <span className="text-sm text-red-600">{errors.newPassword?.message}</span>
          </div>
          <div className="w-full">
            <label htmlFor="confirmPassword">Confirmar Nova Senha: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="confirmPassword"
              placeholder="Confirme sua nova senha"
              {...register('confirmPassword')}
            />
            <span className="text-sm text-red-600">{errors.confirmPassword?.message}</span>
          </div>
          <div className="flex gap-4 mt-2">
            <button
              type="button"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block"
              onClick={() => setIsModalOpen(true)}
            >
              Requisitar Token
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block"
            >
              Alterar Senha
            </button>
          </div>
        </form>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
        }}
      >
        <RequestTokenForm />
      </Modal>
    </div>
  )
}

export default PasswordResetPage
