import { Check, Pen, X } from 'lucide-react'
import { areaAPI } from '../../features/area/area-api'
import { useForm, type SubmitHandler } from 'react-hook-form'
import Modal from '../../components/modal/Modal'
import { useState } from 'react'

const Areas: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)
  const { register, handleSubmit, watch, reset } = useForm<{ areaName: string }>()
  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    setValue,
  } = useForm<{ updateName: string }>()

  const { data } = areaAPI.useGetAreasQuery(undefined)
  const [createArea] = areaAPI.useCreateAreaMutation()
  const [deleteArea] = areaAPI.useDeleteAreaMutation()
  const [updateArea] = areaAPI.useUpdateAreaMutation()

  const areaNameValue = watch('areaName')

  const onCreateFormSubmit: SubmitHandler<{ areaName: string }> = async (data) => {
    try {
      await createArea({ name: data.areaName }).unwrap()
      reset()
    } catch (error) {
      console.error('Failed to create area:', error)
    }
  }

  const handleDelete = async (areaId: number) => {
    try {
      await deleteArea(areaId).unwrap()
    } catch (error) {
      console.error('Failed to delete area:', error)
    }
  }

  const onUpdateFormSubmit: SubmitHandler<{ updateName: string }> = async (data) => {
    if (selectedAreaId !== null) {
      try {
        await updateArea({ id: selectedAreaId, name: data.updateName }).unwrap()
        setIsModalOpen(false)
        resetUpdate()
      } catch (error) {
        console.error('Failed to update area: ', error)
      }
    }
  }

  const openEditModal = (area: { id: number; name: string }) => {
    setSelectedAreaId(area.id)
    setValue('updateName', area.name)
    setIsModalOpen(true)
  }

  return (
    <div className="bg-gray-100 min-h-screen py-5">
      <div className="flex flex-col gap-4 m-auto mt-5 w-xs bg-white sm:w-sm md:w-md p-8 rounded-xl">
        <h1 className="text-2xl pt-5 pb-10">Áreas</h1>
        {data?.map((area) => (
          <div
            key={area.id}
            className="flex p-2 rounded-2xl justify-between py-2 px-4 border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex gap-4">
              <h2>{area.name}</h2>
            </div>
            <div className="flex gap-2 items-center">
              <Pen
                className="hover:text-blue-600 hover:bg-blue-200 transition-colors rounded-xs hover:cursor-pointer size-6 p-1"
                onClick={() => openEditModal(area)}
              />
              <X
                className="hover:text-red-600 hover:bg-red-200 transition-colors rounded-xs hover:cursor-pointer"
                onClick={() => handleDelete(area.id)}
              />
            </div>
          </div>
        ))}
        <form
          className="flex flex-col w-1/3 mx-auto mt-5 items-center"
          onSubmit={handleSubmit(onCreateFormSubmit)}
        >
          <div>
            <label htmlFor="areaName">Adicionar Área</label>
            <div className="relative">
              {areaNameValue && (
                <Check
                  onClick={handleSubmit(onCreateFormSubmit)}
                  className="absolute left-43 top-1/2 -translate-y-1/2 hover:cursor-pointer hover:text-green-700 hover:bg-green-200 transition-colors rounded-xs animated-pulse"
                />
              )}
              <input
                {...register('areaName', { required: true })}
                type="text"
                placeholder="Nome da nova área"
                className="border-2 border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>
        </form>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="text-center text-xl font-semibold">Editar Área</div>
        <form onSubmit={handleSubmitUpdate(onUpdateFormSubmit)}>
          <div className="text-center py-4">
            <input
              {...registerUpdate('updateName', { required: true })}
              type="text"
              className="border-2 border-gray-300 rounded-lg p-2"
              placeholder="Novo nome..."
            />
          </div>
          <div className="flex gap-4 justify-center">
            <button
              type="submit"
              className="hover:cursor-pointer bg-blue-200 text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 hover:text-blue-100 transition"
            >
              Salvar
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="hover:cursor-pointer bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-red-100 transition"
            >
              Fechar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Areas
