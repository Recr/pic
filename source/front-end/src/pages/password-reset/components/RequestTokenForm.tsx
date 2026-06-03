import { authAPI } from '../../../features/auth/auth-api'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestTokenSchema } from '../../../validation/schemas/login-schemas'
import type z from 'zod'
import { toast } from 'react-toastify/unstyled'

const RequestTokenForm: React.FC = () => {
  const [requestToken] = authAPI.useRequestPasswordResetTokenMutation()
  type RequestTokenFormValues = z.infer<typeof requestTokenSchema>
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(requestTokenSchema),
  })

  const onSubmit = async (data: RequestTokenFormValues) => {
    try {
      await requestToken(data).unwrap()
      toast.success('Token de recuperação criado. Contate o administrador.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
    } catch {
      toast.error('Erro ao requisitar token. Tente novamente.', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
      })
    }
  }
  return (
    <form
      className="w-2xs p-2 bg-white rounded-2xl m-auto"
      onSubmit={async (e) => {
        e.preventDefault()
        await handleSubmit(onSubmit)()
      }}
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
        Requisitar Token de Recuperação de Senha
      </h2>
      <div className="flex flex-col">
        <label htmlFor="re">RE:</label>
        <input
          className="w-full p-2.5 pr-9 my-1.5 rounded-[5px] border border-[#ccc] bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
          type="number"
          id="re"
          placeholder="Digite seu RE (Matrícula)"
          {...register('re')}
        />
      </div>
      <span className="text-sm text-red-600">{errors.re?.message}</span>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded hover:cursor-pointer transition-colors m-auto block"
        type="submit"
      >
        Requisitar Token
      </button>
    </form>
  )
}

export default RequestTokenForm
