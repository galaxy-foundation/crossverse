import { configureStore } from '@reduxjs/toolkit'
import shareSlice from './reducer'

export default configureStore({ reducer: shareSlice.reducer })