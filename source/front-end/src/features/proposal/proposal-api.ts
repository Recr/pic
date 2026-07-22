import type {
  AdminUpdateProposalWithChampionRequest,
  CreateProposalRequest,
  UpdateProposalNotesRequest,
  Proposal,
  ProposalAttachment,
  ProposalDetailedPaginationResponse,
  ProposalWithSuggestions,
  ProposalDetailedQueryParams,
  UpdateProposalWithChampionRequest,
  FinishProposalRequest,
} from './types'
import { api } from '../../services/api'

export const proposalAPI = api.injectEndpoints({
  endpoints: (builder) => ({
    createProposal: builder.mutation<Proposal, CreateProposalRequest>({
      query: (body) => ({
        url: '/proposals',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Proposal'],
    }),
    getProposalsWithEmployees: builder.query<ProposalWithSuggestions[], void>({
      query: () => ({
        url: '/proposals/with-employees',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Proposal' as const, id })),
              { type: 'Proposal', id: 'LIST' },
            ]
          : [{ type: 'Proposal', id: 'LIST' }],
    }),
    getProposalsDetailed: builder.query<
      ProposalDetailedPaginationResponse,
      ProposalDetailedQueryParams
    >({
      query: ({
        limit,
        offset,
        id,
        re,
        employeeName,
        description,
        dateFrom,
        dateTo,
        status,
        categoryId,
        areaId,
        includeInactive,
      }) => {
        const params = new URLSearchParams({
          limit: String(limit),
          offset: String(offset),
        })

        if (id !== undefined) {
          params.set('id', String(id))
        }

        if (re !== undefined) {
          params.set('re', String(re))
        }

        if (employeeName) {
          params.set('employeeName', employeeName)
        }

        if (description) {
          params.set('description', description)
        }

        if (dateFrom) {
          params.set('dateFrom', dateFrom)
        }

        if (dateTo) {
          params.set('dateTo', dateTo)
        }

        if (status) {
          params.set('status', status)
        }

        if (categoryId !== undefined) {
          params.set('categoryId', String(categoryId))
        }

        if (areaId !== undefined) {
          params.set('areaId', String(areaId))
        }

        if (includeInactive !== undefined) {
          params.set('includeInactive', String(includeInactive))
        }

        return {
          url: `/proposals/detailed?${params.toString()}`,
          method: 'GET',
        }
      },
      providesTags: (result) =>
        result
          ? [
              ...result.proposals.map(({ id }) => ({ type: 'Proposal' as const, id })),
              { type: 'Proposal', id: 'LIST' },
            ]
          : [{ type: 'Proposal', id: 'LIST' }],
    }),
    getProposalsWithoutChampion: builder.query<ProposalWithSuggestions[], void>({
      query: () => ({
        url: '/proposals/to-define-champion',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Proposal' as const, id })),
              { type: 'Proposal', id: 'LIST' },
            ]
          : [{ type: 'Proposal', id: 'LIST' }],
    }),
    getProposalsWithoutManager: builder.query<ProposalWithSuggestions[], void>({
      query: () => ({
        url: '/proposals/to-define-manager',
        method: 'GET',
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Proposal' as const, id })),
              { type: 'Proposal', id: 'LIST' },
            ]
          : [{ type: 'Proposal', id: 'LIST' }],
    }),
    adminUpdateProposalWithChampion: builder.mutation<
      Proposal,
      { body: AdminUpdateProposalWithChampionRequest; proposalId: string }
    >({
      query: ({ body, proposalId }) => ({
        url: `/proposals/${proposalId}/admin-define-champion`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    updateProposalWithChampion: builder.mutation<
      Proposal,
      { body: UpdateProposalWithChampionRequest; proposalId: string }
    >({
      query: ({ body, proposalId }) => ({
        url: `/proposals/${proposalId}/define-champion`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    updateProposalWithManager: builder.mutation<Proposal, { proposalId: string; data: FormData }>({
      query: ({ data, proposalId }) => ({
        url: `/proposals/${proposalId}/define-manager`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    proposalChampionReview: builder.mutation<
      Proposal,
      { proposalId: string; data: FinishProposalRequest }
    >({
      query: ({ proposalId, data }) => ({
        url: `/proposals/${proposalId}/champion-review`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    updateChampionNotes: builder.mutation<
      Proposal,
      { proposalId: string; body: UpdateProposalNotesRequest }
    >({
      query: ({ proposalId, body }) => ({
        url: `/proposals/${proposalId}/champion-notes`,
        method: 'PUT',
        body,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    rejectProposalAsAdmin: builder.mutation<
      Proposal,
      { proposalId: string; rejectionNote: string }
    >({
      query: ({ proposalId, rejectionNote }) => ({
        url: `/proposals/${proposalId}/admin-rejection?rejectionNote=${encodeURIComponent(
          rejectionNote,
        )}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    rejectProposalAsManager: builder.mutation<
      Proposal,
      { proposalId: string; rejectionNote: string }
    >({
      query: ({ proposalId, rejectionNote }) => ({
        url: `/proposals/${proposalId}/reject?rejectionNote=${encodeURIComponent(rejectionNote)}`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    uploadProposalAttachments: builder.mutation<
      ProposalAttachment[],
      { proposalId: number; files: File[] }
    >({
      query: ({ proposalId, files }) => {
        const formData = new FormData()
        files.forEach((file) => {
          formData.append('attachments', file)
        })

        return {
          url: `/proposals/${proposalId}/attachments`,
          method: 'POST',
          body: formData,
        }
      },
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: proposalId },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    deleteProposalAttachment: builder.mutation<void, { proposalId: number; attachmentId: number }>({
      query: ({ proposalId, attachmentId }) => ({
        url: `/proposals/${proposalId}/attachments/${attachmentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: proposalId },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    undoImplementedToImplementation: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/undo/implemented-to-implementation`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    undoImplementationToToImplement: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/undo/implementation-to-to-implement`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    undoToImplementToUnderValidation: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/undo/to-implement-to-under-validation`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    undoRejectedToUnderValidation: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/undo/rejected-to-under-validation`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    undoRejectedToDefineChampion: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/undo/rejected-to-define-champion`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    softDeleteProposal: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    restoreProposal: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/restore`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    updateProposalManager: builder.mutation<Proposal, { proposalId: string; managerRe: number }>({
      query: ({ proposalId, managerRe }) => ({
        url: `/proposals/${proposalId}/update-manager`,
        method: 'PUT',
        body: { managerRe },
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    updateProposalChampion: builder.mutation<Proposal, { proposalId: string; championRe: number }>({
      query: ({ proposalId, championRe }) => ({
        url: `/proposals/${proposalId}/update-champion`,
        method: 'PUT',
        body: { championRe },
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
    implementedProposalManagerReview: builder.mutation<
      Proposal,
      { proposalId: string; data: FinishProposalRequest }
    >({
      query: ({ proposalId, data }) => ({
        url: `/proposals/${proposalId}/implemented-proposal-manager-review`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
  }),
})
