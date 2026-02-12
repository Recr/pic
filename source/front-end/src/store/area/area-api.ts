import { api } from '../api'

interface Area {
  id: number
  name: string
}

export const areaAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    getAreas: builder.query<Area[], void>({
      query: () => '/areas',
      providesTags: ['Area'],
    }),
    createArea: builder.mutation<Area, { name: string }>({
      query: (body) => ({
        url: `areas`,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Area'],
    }),
    deleteArea: builder.mutation<void, number>({
      query: (areaId) => ({
        url: `/areas/${areaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Area'],
    }),
    updateArea: builder.mutation<Area, { id: number; name: string }>({
      query: ({ id, name }) => ({
        url: `/areas/${id}`,
        method: 'PUT',
        body: { name },
      }),
      invalidatesTags: ['Area'],
    }),
  }),
})
