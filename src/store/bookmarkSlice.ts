import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Bookmark {
  id: string;
  prompt: string;
  createdAt: string;
  responses: Array<{
    id: string;
    content: string[];
    read: boolean;
    createdAt: string;
  }>;
}

interface BookmarkState {
  bookmarks: Bookmark[];
}

const initialState: BookmarkState = {
  bookmarks: []
};

const bookmarkSlice = createSlice({
  name: 'bookmarks',
  initialState,
  reducers: {
    addBookmark: (state, action: PayloadAction<{ prompt: string }>) => {
      const newBookmark: Bookmark = {
        id: crypto.randomUUID(),
        prompt: action.payload.prompt,
        createdAt: new Date().toISOString(),
        responses: []
      };
      state.bookmarks.push(newBookmark);
    },
    updateBookmark: (state, action: PayloadAction<{ id: string; prompt: string }>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.id);
      if (bookmark) {
        bookmark.prompt = action.payload.prompt;
      }
    },
    addResponse: (state, action: PayloadAction<{ bookmarkId: string; content: string[] }>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.bookmarkId);
      if (bookmark) {
        bookmark.responses.push({
          id: crypto.randomUUID(),
          content: action.payload.content,
          read: false,
          createdAt: new Date().toISOString()
        });
      }
    },
    markResponseAsRead: (state, action: PayloadAction<{ bookmarkId: string; responseId: string }>) => {
      const bookmark = state.bookmarks.find(b => b.id === action.payload.bookmarkId);
      if (bookmark) {
        const response = bookmark.responses.find(r => r.id === action.payload.responseId);
        if (response) {
          response.read = true;
        }
      }
    }
  }
});

export const { addBookmark, updateBookmark, addResponse, markResponseAsRead } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;