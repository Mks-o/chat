import { configureStore } from '@reduxjs/toolkit';
import { alertSliceReducer } from './slices/alertSlice';
import { colorsSliceReducer } from './slices/colorsSlice';
import { nameSliceReducer } from './slices/nameSlice';
import { progressSliceReducer } from './slices/progressSlice';
import { messageSliceReducer } from './slices/messageSlice';
import { iconsSliceReducer } from './slices/iconsSlice';
import { settingsSliceReducer } from './slices/settingsSlice';

export const store = configureStore(
    {
        reducer: {
        alert: alertSliceReducer,
        color:colorsSliceReducer,
        name:nameSliceReducer,
        progress:progressSliceReducer,
        message:messageSliceReducer,
        icon:iconsSliceReducer,
        settings:settingsSliceReducer
        }
    }
)