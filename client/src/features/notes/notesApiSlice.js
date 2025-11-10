// ? createSelector = utility from Redux Toolkit to build memoized selectors.
//   It caches the last result so it only recomputes when the inputs change.
// ? createEntityAdapter = helper that simplifies managing collections (arrays)
//   of items in normalized form: { ids: [], entities: { id: item } }.
import {
  createSelector,
  createEntityAdapter
} from "@reduxjs/toolkit";

// ? apiSlice = the base RTK Query API configuration that defines the backend base URL
//   and common API setup for the entire app (like 'http://localhost:3500').
//   Here we will *extend* it with new endpoints for notes.
import { apiSlice } from "../../app/api/apiSlice"

const notesAdapter = createEntityAdapter({
    sortComparer: (a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1
})
// -------------------------------------------------------------
// 1️⃣ Create an Entity Adapter to handle note data normalization
// -------------------------------------------------------------

// ? notesAdapter creates predefined reducers and selectors for a list of notes.
//   This helps us easily add/update/remove notes in Redux without manual reducers.


// ? initialState = empty normalized state structure:
//   { ids: [], entities: {} }
const initialState = notesAdapter.getInitialState()

// -------------------------------------------------------------
// 2️⃣ Extend the base apiSlice with a new endpoint: getNotes
// -------------------------------------------------------------

export const notesApiSlice = apiSlice.injectEndpoints({
 endpoints: builder => ({
        getNotes: builder.query({
            query: () => '/notes',
            validateStatus: (response, result) => {
                return response.status === 200 && !result.isError
            },
            transformResponse: responseData => {
                const loadedNotes = responseData.map(note => {
                    note.id = note._id
                    return note
                });
                return notesAdapter.setAll(initialState, loadedNotes)
            },
            providesTags: (result, error, arg) => {
                if (result?.ids) {
                    return [
                        { type: 'Note', id: 'LIST' },
                        ...result.ids.map(id => ({ type: 'Note', id }))
                    ]
                } else return [{ type: 'Note', id: 'LIST' }]
            }
        }),
        addNewNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'POST',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: [
                { type: 'Note', id: "LIST" }
            ]
        }),
        updateNote: builder.mutation({
            query: initialNote => ({
                url: '/notes',
                method: 'PATCH',
                body: {
                    ...initialNote,
                }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
        deleteNote: builder.mutation({
            query: ({ id }) => ({
                url: `/notes`,
                method: 'DELETE',
                body: { id }
            }),
            invalidatesTags: (result, error, arg) => [
                { type: 'Note', id: arg.id }
            ]
        }),
    }),
})

// -------------------------------------------------------------
// 3️⃣ Export the auto-generated hook from RTK Query
// -------------------------------------------------------------

// ? RTK Query automatically generates a React hook for each endpoint.
//   Here: useGetNotesQuery() will perform the GET /notes request and
//   give you { data, isLoading, isSuccess, isError, error } in a component.
export const { useGetNotesQuery } = notesApiSlice

// -------------------------------------------------------------
// 4️⃣ Selectors to access note data directly from Redux store
// -------------------------------------------------------------

// ? selectNotesResult = selector that returns the full query result object
//   (includes data, status flags, timestamps, etc.)
export const selectNotesResult = notesApiSlice.endpoints.getNotes.select()

// ? selectNotesData = memoized selector that extracts only the normalized note data
//   from the full query result. If the data hasn’t changed, the cached result is reused.
const selectNotesData = createSelector(
  selectNotesResult,
  notesResult => notesResult.data // data = { ids: [...], entities: {...} }
)

// -------------------------------------------------------------
// 5️⃣ Generate prebuilt selectors from the entity adapter
// -------------------------------------------------------------

// ? notesAdapter.getSelectors() creates a set of handy selectors:
//   - selectAll: returns all notes as an array
//   - selectById: returns one note by id
//   - selectIds: returns an array of all note ids
// ? We destructure them and rename for clarity.
export const {
  selectAll: selectAllNotes,
  selectById: selectNoteById,
  selectIds: selectNoteIds
  // ? getSelectors expects a function that tells it where to find
  //   the normalized note data in the Redux store.
  // ? We pass a selector (state => selectNotesData(state) ?? initialState)
  //   meaning: use selectNotesData if available, else fallback to empty state.
} = notesAdapter.getSelectors(state => selectNotesData(state) ?? initialState)
