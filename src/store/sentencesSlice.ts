// src/store/sentencesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Sentence {
  lang_code: string;
  text: string;
}

interface SentencesState {
  sentences: Sentence[];
}

const initialState: SentencesState = {
  sentences: [],
};

const sentencesSlice = createSlice({
  name: 'sentences',
  initialState,
  reducers: {
    setSentences: (state, action: PayloadAction<Sentence[]>) => {
      state.sentences = action.payload;
    },
  },
});

export const { setSentences } = sentencesSlice.actions;
export default sentencesSlice.reducer;
