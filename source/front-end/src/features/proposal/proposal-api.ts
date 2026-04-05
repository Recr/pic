import type {
  AdminUpdateProposalWithChampionRequest,
  CreateProposalRequest,
  Proposal,
  ProposalDetailed,
  ProposalWithSuggestions,
  UpdateProposalWithManagerRequest,
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
    getProposalsDetailed: builder.query<ProposalDetailed[], void>({
      query: () => ({
        url: '/proposals/detailed',
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
    updateProposalWithManager: builder.mutation<
      Proposal,
      { body: UpdateProposalWithManagerRequest; proposalId: string }
    >({
      query: ({ body, proposalId }) => ({
        url: `/proposals/${proposalId}/define-manager`,
        method: 'PUT',
        body,
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
    rejectProposalAsAdmin: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/admin-rejection`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
  }),
})
