import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    showRes: false,
    showHelp: false,
    showControls: false,
    showVideo: false,
    showText: true,
    showAllIcons: true
}
const settingsSlice = createSlice({
    name: 'settings',
    initialState,
    reducers: {
        showRes: (state, action) => {
            state.showRes = action.payload;
        },
        showHelp: (state, action) => {
            state.showHelp = action.payload;
        },
        showControls: (state, action) => {
            state.showControls = action.payload;
        },
        setShowVideo: (state, action) => {
            state.showVideo = action.payload;
        },
        setShowText: (state, action) => {
            state.showText = action.payload;
        },
        setShowAllIcons: (state, action) => {
            state.showAllIcons = action.payload;
        },
    }
})
export const { showRes, showHelp, showControls, setShowVideo, setShowText, setShowAllIcons } = settingsSlice.actions
export const settingsSliceReducer = settingsSlice.reducer