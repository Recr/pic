import type {
  CreateProposalRequest,
  Proposal,
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
    getProposalsWithEmployees: builder.query<Proposal[], void>({
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
    updateProposalWithRejection: builder.mutation<Proposal, { proposalId: string }>({
      query: ({ proposalId }) => ({
        url: `/proposals/${proposalId}/reject`,
        method: 'PUT',
      }),
      invalidatesTags: (_result, _error, { proposalId }) => [
        { type: 'Proposal', id: Number(proposalId) },
        { type: 'Proposal', id: 'LIST' },
      ],
    }),
  }),
})
