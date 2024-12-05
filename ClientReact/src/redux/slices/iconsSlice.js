import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    image: {
        show: false,
        simvol: "",
        src: ""
    }
}
const iconsSlice = createSlice({
    name: 'icon',
    initialState,
    reducers: {
        createIcon: (state, action) => {
            state.image = action.payload
        },
        setshowIcons:(state,action)=>{
            state.show=action.payload
        }
    }
})
export const { createIcon, setshowIcons } = iconsSlice.actions
export const iconsSliceReducer = iconsSlice.reducer