import { useForm } from 'react-hook-form'
import { changePasswordSchema } from '../../validation/schemas/login-schemas'
import { zodResolver } from '@hookform/resolvers/zod/src/zod.js'
import type z from 'zod'
import { toast } from 'react-toastify/unstyled'
import { authAPI } from '../../features/auth/auth-api'

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
}
const PasswordChangePage: React.FC = () => {
  const [changePassword] = authAPI.useChangePasswordMutation()

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ChangePasswordSchema>({
    resolver: zodResolver(changePasswordSchema),
  })

  const onSubmit = async (data: ChangePasswordSchema) => {
    try {
      await changePassword(data).unwrap()
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
    <>
      <div className="w-md mx-auto mt-10">
        <form action="" onSubmit={handleSubmit(onSubmit)}>
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">
            Altere sua senha para continuar
          </h1>
          <div className="w-full">
            <label htmlFor="currentPassword">Senha Atual: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="currentPassword"
              placeholder="Digite sua senha atual"
              {...register('currentPassword')}
            />
          </div>
          <span className="text-sm text-red-600">{errors.currentPassword?.message}</span>

          <div className="w-full">
            <label htmlFor="newPassword">Nova Senha: </label>
            <input
              className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="password"
              id="newPassword"
              placeholder="Digite sua nova senha"
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
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block"
          >
            Alterar Senha
          </button>
        </form>
      </div>
    </>
  )
}

export default PasswordChangePage
