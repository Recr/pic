import { useForm } from 'react-hook-form'

const LoginForm: React.FC = () => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm()
  return (
    <div className="bg-gray-50 h-dvh pt-20">
      <form className="mx-auto flex justify-center flex-col w-xs py-12 bg-white  rounded-lg items-center gap-4 shadow-xl drop-shadow-black">
        <h2 className="font-bold text-xl text-left w-3xs">Login</h2>
        <div className="flex flex-col">
          <label htmlFor="re" className="text-gray-600 text-xs">
            RE
          </label>
          <input
            type="number"
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
