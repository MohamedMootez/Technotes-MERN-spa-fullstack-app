// The apiSlice file is your base RTK Query configuration —
// it defines how to talk to your backend (baseUrl),
// what data types you’ll cache (tagTypes),
// and serves as the foundation that all your other API files plug their endpoints into.

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const apiSlice = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3500' }),
    tagTypes: ['Note', 'User'],
    endpoints: builder => ({})
})