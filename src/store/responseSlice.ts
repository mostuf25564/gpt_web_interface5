import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Sentence } from '../types/sentence';

interface ResponseState {
  sentences: Sentence[];
  selectedBookmarkResponse: string[] | null;
}

const initialState: ResponseState = {
  sentences: [],
  selectedBookmarkResponse: null
};

const responseSlice = createSlice({
  name: 'response',
  initialState,
  reducers: {
    updateResponseSentences(state, action: PayloadAction<Sentence[]>) {
      state.sentences = action.payload;
    },
    setSelectedBookmarkResponse(state, action: PayloadAction<string[] | null>) {
      state.selectedBookmarkResponse = action.payload;
    }
  }
});

export const { updateResponseSentences, setSelectedBookmarkResponse } = responseSlice.actions;
export default responseSlice.reducer;