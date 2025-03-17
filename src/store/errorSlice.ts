import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AppError {
  id: string;
  message: string;
  timestamp: string;
  type: 'api' | 'system' | 'user';
}

interface ErrorState {
  errors: AppError[];
}

const initialState: ErrorState = {
  errors: []
};

const errorSlice = createSlice({
  name: 'errors',
  initialState,
  reducers: {
    addError: (state, action: PayloadAction<Omit<AppError, 'id' | 'timestamp'>>) => {
      state.errors.push({
        id: crypto.randomUUID(),
        ...action.payload,
        timestamp: new Date().toISOString()
      });
    },
    clearError: (state, action: PayloadAction<string>) => {
      state.errors = state.errors.filter(error => error.id !== action.payload);
    },
    clearAllErrors: (state) => {
      state.errors = [];
    }
  }
});

export const { addError, clearError, clearAllErrors } = errorSlice.actions;
export default errorSlice.reducer;