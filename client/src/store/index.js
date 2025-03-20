import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import groupReducer from './groupSlice';
import expenseReducer from './expenseSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    groups: groupReducer,
    expenses: expenseReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
