import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {   ValidResponse } from './promptSlice';

export type ValidResponseRead =ValidResponse & {read: boolean;};
export interface Bookmark {
  id: string;
  prompt: string;
  createdAt: string;
  validResponses: ValidResponseRead[];
}

interface BookmarkState {
  bookmarks: Bookmark[];
}

const initialState: BookmarkState = {
  bookmarks: []
};

const bookmarkSlice = createSlice({
  name: 'bookmarksSlice',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<{ prompt: string, id:string }>) => {
      const newBookmark: Bookmark = {
        id: action.payload.id, 
   
        prompt: action.payload.prompt,
        createdAt: new Date().toISOString(),
        validResponses: []
      };
      state.bookmarks.push(newBookmark);
    },
    updateBookmark: (state, action: PayloadAction<{ id: string; prompt: string }>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.id);
      if (bookmark) {
        bookmark.prompt = action.payload.prompt;
      }
    },
    addResponse: (state, action: PayloadAction<{ bookmarkId: string; validResponse: ValidResponse}>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.bookmarkId);
      if (bookmark) {
        bookmark.validResponses.push({...action.payload.validResponse, read:false} as ValidResponseRead)
     
      }
    },
    markResponseAsRead: (state, action: PayloadAction<{ bookmarkId: string; responseId: string }>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.bookmarkId);
      if (bookmark) {
        const response = bookmark.validResponses.find(r => r.id === action.payload.responseId);
        if (response) {
          response.read = true;
        }
      }
    }
  }
});

export const { addBookmark, updateBookmark, addResponse, markResponseAsRead } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;