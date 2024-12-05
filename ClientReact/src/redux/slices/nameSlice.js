import { createSlice } from '@reduxjs/toolkit'

const initialState = {
        name:""
}
const nameSlice = createSlice({
    name: 'name',
    initialState,
    reducers: {
        setName: (state, action) => {
        state.name = action.payload
        },
    }
})
export const { setName } = nameSlice.actions
export const nameSliceReducer = nameSlice.reducer