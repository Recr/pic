import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { CreateProposalRequest, Proposal } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const proposalAPI = createApi({
  reducerPath: "proposal-api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // Add any auth tokens or custom headers here
      const token = localStorage.getItem("authToken");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Proposal"],
  endpoints: (builder) => ({
    createProposal: builder.mutation<Proposal, CreateProposalRequest>({
      query: (body) => ({
        url: "/proposals",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Proposal"],
    }),
    getProposalsWithEmployees: builder.query<Proposal[], void>({
      query: () => ({
        url: "/proposals/with-employees",
        method: "GET",
      }),
      providesTags: ["Proposal"],
    }),
  }),
});
