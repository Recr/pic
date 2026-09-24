import { Pen, X } from 'lucide-react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import Modal from '../../components/modal/Modal'
import { useState } from 'react'
import { categoryAPI } from '../../features/category/category-api'
import type { Category } from '../../features/category/types'
import type z from 'zod'
import {
  createCategorySchema,
  updateCategorySchema,
} from '../../validation/schemas/category-schemas'
import { zodResolver } from '@hookform/resolvers/zod'
import { Skeleton } from '../../components/skeletons/Skeleton'

const Categories: React.FC = () => {
  const { data: categoriesList, isLoading } = categoryAPI.useGetCategoriesQuery()
  const [createCategory] = categoryAPI.useCreateCategoryMutation()
  const [deleteCategory] = categoryAPI.useDeleteCategoryMutation()
  const [updateCategory] = categoryAPI.useUpdateCategoryMutation()

  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(null)

  type UpdateCategoryInputSchema = z.input<typeof updateCategorySchema>
  type UpdateCategoryOutputSchema = z.output<typeof updateCategorySchema>
  type CreateCategoryInputSchema = z.input<typeof createCategorySchema>
  type CreateCategoryOutputSchema = z.output<typeof createCategorySchema>

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate },
  } = useForm<CreateCategoryInputSchema, undefined, CreateCategoryOutputSchema>({
    resolver: zodResolver(createCategorySchema),
  })

  const {
    register: registerUpdate,
    handleSubmit: handleSubmitUpdate,
    reset: resetUpdate,
    setValue: setValueUpdate,
    formState: { errors: errorsUpdate },
  } = useForm<UpdateCategoryInputSchema, undefined, UpdateCategoryOutputSchema>({
    resolver: zodResolver(updateCategorySchema),
  })

  const onCreateFormSubmit: SubmitHandler<CreateCategoryOutputSchema> = async (data) => {
    try {
      await createCategory(data).unwrap()
      resetCreate()
    } catch (error) {
      console.error('Failed to create area:', error)
    }
  }

  const handleDelete = async (categoryId: number) => {
    try {
      await deleteCategory(categoryId).unwrap()
    } catch (error) {
      console.error('Failed to delete area:', error)
    }
  }

  const onUpdateFormSubmit: SubmitHandler<UpdateCategoryOutputSchema> = async (data) => {
    if (selectedAreaId)
      try {
        console.log('success')
        await updateCategory({ ...data, id: selectedAreaId }).unwrap()
        setIsUpdateModalOpen(false)
        resetUpdate()
      } catch (error) {
        console.error('Failed to update area: ', error)
      }
  }

  const openEditModal = (category: Category) => {
    setSelectedAreaId(category.id)
    setValueUpdate('name', category.name)
    setValueUpdate('categoryReward', category.categoryReward)
    setIsUpdateModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen py-5">
        <div className="m-auto flex w-xs flex-col gap-4 rounded-xl bg-white p-8 sm:w-sm md:w-md lg:w-xl">
          <Skeleton className="h-8 w-40" />
          <div className="flex flex-col gap-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex w-full items-center gap-4">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="size-6 rounded-md" />
                  <Skeleton className="size-6 rounded-md" />
                </div>
              </div>
            ))}
          </div>
          <div className="mx-auto mt-10 flex w-1/3 flex-col items-center gap-3">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-primary-gray min-h-screen py-5">
      <div className="flex flex-col gap-4 m-auto bg-white w-xs sm:w-sm md:w-md lg:w-xl p-8 rounded-xl">
        <h1 className="text-2xl pt-5 pb-10">Categorias</h1>
        {categoriesList?.map((category) => (
          <div
            key={category.id}
            className="bg-white flex py-2 px-4 rounded-2xl justify-between border border-gray-200 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="flex gap-4">
              <h2>{category.name}</h2>
              {category.categoryReward && (
                <p className="text-gray-500 text-xs items-center flex">
                  R$ {category.categoryReward}
                </p>
              )}
            </div>
            <div className="flex gap-2 items-center">
              <Pen
                className="hover:text-blue-600 hover:bg-blue-200 transition-colors rounded-xs hover:cursor-pointer size-6 p-1"
                onClick={() => openEditModal(category)}
              />
              <X
                className="hover:text-red-600 hover:bg-red-200 transition-colors rounded-xs hover:cursor-pointer"
                onClick={() => handleDelete(category.id)}
              />
            </div>
          </div>
        ))}
        <form
          className="flex flex-col w-1/3 mx-auto mt-10 items-center"
          onSubmit={handleSubmitCreate(onCreateFormSubmit)}
        >
          <div>
            <label htmlFor="categoryName">Adicionar Categoria</label>
            <input
              {...registerCreate('name', { required: true })}
              type="text"
              placeholder="Nome da nova categoria"
              className="border-2 border-gray-300 rounded-lg p-2 mb-3"
            />
            {errorsCreate.name && (
              <span className="text-xs text-red-600">{errorsCreate.name?.message}</span>
            )}
            <input
              {...registerCreate('categoryReward')}
              type="text"
              placeholder="Premio da categoria"
              className="border-2 border-gray-300 rounded-lg p-2 mb-3"
            />
            {errorsCreate.categoryReward && (
              <span className="text-xs text-red-600">{errorsCreate.categoryReward?.message}</span>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-sm hover:bg-blue-700 transition-colors hover:cursor-pointer w-full"
            >
              Criar
            </button>
          </div>
        </form>
      </div>
      <Modal isOpen={isUpdateModalOpen} onClose={() => setIsUpdateModalOpen(false)}>
        <div className="w-64 min-h-50 sm:w-sm">
          <div className="text-center text-xl font-semibold">Editar Categoria</div>
          <form onSubmit={handleSubmitUpdate(onUpdateFormSubmit)}>
            <div className="text-center py-4 flex flex-col gap-2">
              <input
                {...registerUpdate('name', { required: true })}
                type="text"
                className="border-2 border-gray-300 rounded-lg p-2"
                placeholder="Novo nome..."
              />
              {errorsUpdate.name && (
                <span className="text-xs text-red-600">{errorsUpdate.name?.message}</span>
              )}
              <input
                {...registerUpdate('categoryReward')}
                type="number"
                step="any"
                className="border-2 border-gray-300 rounded-lg p-2"
                placeholder="Prêmio"
              />
              {errorsUpdate.categoryReward && (
                <span className="text-xs text-red-600">{errorsUpdate.categoryReward?.message}</span>
              )}
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
                onClick={() => setIsUpdateModalOpen(false)}
                className="hover:cursor-pointer bg-red-200 text-red-600 font-semibold py-2 px-4 rounded-lg hover:bg-red-600 hover:text-red-100 transition"
              >
                Fechar
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  )
}

export default Categories
