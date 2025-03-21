import { configureStore } from '@reduxjs/toolkit';
import sentencesReducer from './sentencesSlice';
import promptReducer from './promptSlice';
import responseReducer from './responseSlice';
import bookmarkReducer from './bookmarkSlice';
import errorReducer from './errorSlice';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

const store = configureStore({
  reducer: {
    sentences: sentencesReducer,
    prompt: promptReducer,
    response: responseReducer,
    bookmarkSlice: bookmarkReducer,
    errors: errorReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;