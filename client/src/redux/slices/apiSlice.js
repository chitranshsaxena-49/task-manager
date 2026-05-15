import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const getAPIBaseURL = () => {
  // In development with env var, use that (for local backend)
  if (import.meta.env.VITE_APP_BASE_URL) {
    return `${import.meta.env.VITE_APP_BASE_URL}/api`;
  }

  // In production or without env var, use relative API path
  // This works when backend and frontend are served from same domain (e.g., Railway)
  return "/api";
};

const API_URL = getAPIBaseURL();

const baseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
});

export const apiSlice = createApi({
  baseQuery,
  tagTypes: ["Users"],
  endpoints: (builder) => ({}),
});
