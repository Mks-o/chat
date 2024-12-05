
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
        alert:""
}
const alertSlice = createSlice({
    name: 'alert',
    initialState,
    reducers: {
        setAlert: (state, action) => {
        state.alert = action.payload;
        },
    }
})
export const { setAlert } = alertSlice.actions
export const alertSliceReducer = alertSlice.reducer