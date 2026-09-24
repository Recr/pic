import { useSelector } from 'react-redux'
import type { RootState } from '../../app/store'
import { translateRoles } from '../../helpers/translateRoles'
import { useState } from 'react'
import Modal from '../../components/modal/Modal'
import { useForm } from 'react-hook-form'
import type z from 'zod'
import { changePasswordSchema } from '../../validation/schemas/login-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { authAPI } from '../../features/auth/auth-api'
import { toast, ToastContainer } from 'react-toastify/unstyled'

type ChangePasswordSchema = z.infer<typeof changePasswordSchema>

const TOAST_OPTIONS = {
  position: 'top-right' as const,
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
}

const Profile: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user)
  const [isModalOpen, setIsModalOpen] = useState(false)
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
      setIsModalOpen(false)
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
    <div className="bg-primary-gray min-h-screen py-8">
      <ToastContainer />
      <form
        className="bg-white flex flex-col items-center w-90 shadow-custom py-5 px-7.5 mx-auto mb-7.5 rounded-[20px]"
        action=""
      >
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">Meu Perfil</h1>
        <div className="w-full">
          <label htmlFor="name">Nome: </label>
          <input
            className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            id="name"
            value={user?.name}
            readOnly
          />
        </div>
        <div className="w-full">
          <label className="" htmlFor="re">
            Matrícula (RE):{' '}
          </label>
          <input
            className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            id="re"
            value={user?.re}
            readOnly
          />
        </div>
        <div className="w-full">
          <label className="" htmlFor="email">
            Email:{' '}
          </label>
          <input
            className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            id="email"
            value={user?.email}
            readOnly
          />
        </div>
        <div className="w-full">
          <label htmlFor="role">Cargo: </label>
          <input
            className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            id="role"
            value={user?.role && translateRoles(user?.role)}
            readOnly
          />
        </div>
        <div className="w-full">
          <label htmlFor="shift">Turno: </label>
          <input
            className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            type="text"
            id="shift"
            value={user?.shift}
            readOnly
          />
        </div>
      </form>
      <button
        onClick={() => setIsModalOpen(true)}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block mt-4"
      >
        Alterar Senha
      </button>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form action="" onSubmit={handleSubmit(onSubmit)} className="w-70 px-4">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Alterar Senha</h1>
          <div className="">
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
            className="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block"
          >
            Alterar Senha
          </button>
        </form>
      </Modal>
    </div>
  )
}

export default Profile
