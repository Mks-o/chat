import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    recieveMessage: "",
    hasMessage: false,
    messageHistory:[]
}
const messageSlice = createSlice({
    name: 'message',
    initialState,
    reducers: {
        setRecieveMessage: (state, action) => {
            state.recieveMessage = action.payload
        },
        setMessage: (state, action) => {
            state.hasMessage = action.payload
        },
        changeMessageStatus: (state) => {
            state.hasMessage = !state.hasMessage
        },
        setMessageHistory: (state, action) => {
            state.messageHistory.unshift(action.payload)
        },
        
    }
})
export const { setRecieveMessage,setMessage,setMessageHistory,changeMessageStatus } = messageSlice.actions
export const messageSliceReducer = messageSlice.reducer