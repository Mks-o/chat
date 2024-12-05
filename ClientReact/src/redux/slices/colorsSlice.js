import { createSlice } from '@reduxjs/toolkit'

const initialState = {
        color: "#000000",
        colorSecond: "#27292c",
        colorThird: "#000000"
}
const colorsSlice = createSlice({
    name: 'colors',
    initialState,
    reducers: {
        setColor: (state, action) => {
            state.color = action.payload;
        },
        setSecondColor: (state, action) => {
            state.colorSecond = action.payload;
        },
        setThirdColor: (state, action) => {
            state.colorThird = action.payload;
        },
    }
})
export const { setColor,setSecondColor,setThirdColor } = colorsSlice.actions
export const colorsSliceReducer = colorsSlice.reducer