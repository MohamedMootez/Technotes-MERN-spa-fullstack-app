// ? createSelector = utility from Redux Toolkit to build memoized selectors.
//   It caches the last result so it only recomputes when the inputs change.
// ? createEntityAdapter = helper that simplifies managing collections (arrays)
//   of items in normalized form: { ids: [], entities: { id: item } }.
import { createSelector, createEntityAdapter } from "@reduxjs/toolkit";

// ? apiSlice = the base RTK Query API configuration that defines the backend base URL
//   and common API setup for the entire app (like 'http://localhost:3500').
//   Here we will *extend* it with new endpoints for users.
import { apiSlice } from "../../app/api/apiSlice";

// -------------------------------------------------------------
// 1️⃣ Create an Entity Adapter to handle user data normalization
// -------------------------------------------------------------

// ? usersAdapter creates predefined reducers and selectors for a list of users.
//   This helps us easily add/update/remove users in Redux without manual reducers.
const usersAdapter = createEntityAdapter({});

// ? initialState = empty normalized state structure:
//   { ids: [], entities: {} }
const initialState = usersAdapter.getInitialState();

// -------------------------------------------------------------
// 2️⃣ Extend the base apiSlice with a new endpoint: getUsers
// -------------------------------------------------------------

export const usersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: () => "/users",
      validateStatus: (response, result) => {
        return response.status === 200 && !result.isError;
      },
      transformResponse: (responseData) => {
        const loadedUsers = responseData.map((user) => {
          user.id = user._id;
          return user;
        });
        return usersAdapter.setAll(initialState, loadedUsers);
      },
      providesTags: (result, error, arg) => {
        if (result?.ids) {
          return [
            { type: "User", id: "LIST" },
            ...result.ids.map((id) => ({ type: "User", id })),
          ];
        } else return [{ type: "User", id: "LIST" }];
      },
    }),
    addNewUser: builder.mutation({
      query: (initialUserData) => ({
        url: "/users",
        method: "POST",
        body: {
          ...initialUserData,
        },
      }),
      invalidatesTags: [{ type: "User", id: "LIST" }],
    }),
    updateUser: builder.mutation({
      query: (initialUserData) => ({
        url: `/users/`,
        method: "PATCH",
        body: {
          ...initialUserData,
        },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
    deleteUser: builder.mutation({
      query: ({ id }) => ({
        url: `/users`,
        method: "DELETE",
        body: { id },
      }),
      invalidatesTags: (result, error, arg) => [{ type: "User", id: arg.id }],
    }),
  }),
});

// -------------------------------------------------------------
// 3️⃣ Export the auto-generated hook from RTK Query
// -------------------------------------------------------------

// ? RTK Query automatically generates a React hook for each endpoint.
//   Here: useGetUsersQuery() will perform the GET /users request and
//   give you { data, isLoading, isSuccess, isError, error } in a component.
export const {
  useGetUsersQuery,
  useAddNewUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = usersApiSlice;

// -------------------------------------------------------------
// 4️⃣ Selectors to access user data directly from Redux store
// -------------------------------------------------------------

// ? selectUsersResult = selector that returns the full query result object
//   (includes data, status flags, timestamps, etc.)
export const selectUsersResult = usersApiSlice.endpoints.getUsers.select();

// ? selectUsersData = memoized selector that extracts only the normalized user data
//   from the full query result. If the data hasn’t changed, the cached result is reused.
const selectUsersData = createSelector(
  selectUsersResult,
  (usersResult) => usersResult.data // data = { ids: [...], entities: {...} }
);

// -------------------------------------------------------------
// 5️⃣ Generate prebuilt selectors from the entity adapter
// -------------------------------------------------------------

// ? usersAdapter.getSelectors() creates a set of handy selectors:
//   - selectAll: returns all users as an array
//   - selectById: returns one user by id
//   - selectIds: returns an array of all user ids
// ? We destructure them and rename for clarity.
export const {
  selectAll: selectAllUsers,
  selectById: selectUserById,
  selectIds: selectUserIds,
  // ? getSelectors expects a function that tells it where to find
  //   the normalized user data in the Redux store.
  // ? We pass a selector (state => selectUsersData(state) ?? initialState)
  //   meaning: use selectUsersData if available, else fallback to empty state.
} = usersAdapter.getSelectors(
  (state) => selectUsersData(state) ?? initialState
);
