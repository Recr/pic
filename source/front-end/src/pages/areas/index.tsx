import { Box, Check, Pen, X } from "lucide-react"
import { areaAPI } from "../../store/area/area-api"
import { useForm, type SubmitHandler } from 'react-hook-form'
import Modal from "../../components/modal/Modal"
import { useState } from "react"

function Areas () {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmittable, setIsSubmittable] = useState("")
  const { register, handleSubmit, formState: { errors } } = useForm<{ areaName: string }>()


  const { data } = areaAPI.useGetAreasQuery()

  return (
    <>
      <div className="flex flex-col gap-4 m-auto mt-5 w-xs">
        {data?.map(area => (
          <div key={area.id} className="bg-gray-100 flex p-2 rounded-2xl justify-between">
            <div className="flex gap-4">
              <Box />
              <h2>{area.name}</h2>
            </div>
            <div className="flex gap-2 items-center">
              <Pen 
                className="hover:text-blue-600 hover:bg-blue-200 transition-colors rounded-xs hover:cursor-pointer size-6 p-1"
                onClick={() => setIsModalOpen(true)} />
              <X className="hover:text-red-600 hover:bg-red-200 transition-colors rounded-xs hover:cursor-pointer" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <form className="flex flex-col w-1/3 mx-auto mt-10" action="">
          <label htmlFor="areaName">Adicionar Área</label>
          <div className="relative">
            {isSubmittable && <Check className="absolute right-2 top-1/2 -translate-y-1/2 hover:cursor-pointer hover:text-green-700 hover:bg-green-200 transition-colors rounded-xs animated-pulse" />}
            <input 
              name="areaName" 
              type="text"
              value={isSubmittable}
              onChange={(e) => setIsSubmittable(e.target.value)}
              placeholder="Nome da nova área" 
              className="border-2 border-gray-300 rounded-lg p-2" />
              
          </div>
        </form>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center text-xl font-semibold">
          Editar Área
        </div>
        <div className="text-center py-4">
        </div>
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(false)} className="hover:cursor-pointer bg-blue-200 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-blue-100 transition">
            Salvar
          </button>
          <button onClick={() => setIsModalOpen(false)} className="hover:cursor-pointer bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-red-100 transition">
            Fechar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Areas