import type {
  CreateProposalRequest,
  Proposal,
  ProposalDetailed,
  ProposalWithSuggestions,
  UpdateProposalRequest,
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
    updateProposalWithChampion: builder.mutation<
      Proposal,
      { body: UpdateProposalRequest; proposalId: string }
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
    proposalChampionReview: builder.mutation<Proposal, { proposalId: string; status: string }>({
      query: ({ proposalId, status }) => ({
        url: `/proposals/${proposalId}/champion-review`,
        method: 'PUT',
        body: { status },
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
