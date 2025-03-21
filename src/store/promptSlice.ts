import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { sendAIRequest } from '../services/apiService';
import { addBookmark, addResponse, ValidResponseRead } from './bookmarkSlice';
import { addError } from './errorSlice';
import { generateUUID } from '../utils/uuid';
import { Sentence } from '../types/sentence';

const url = 'https://api-git-main-ofershahams-projects.vercel.app/ai/logic';

export interface ValidResponse {
  id: string;
  sentences: Sentence[];
  timestamp: string;
}

export interface UserRequest {
  maxTotalResponseChars: number;
  minTotalResponseChars?: number;
  maxSentences: number;
  minSentences?: number;
  maxWordsInSentence: number;
  inputLanguage: string;
  outputLanguages: string[];
  role: string;
  expected_response_format_to_feed_json_parse: string;
  special_notes: string;
  currentMessage: string;
  scene: string;
}

export interface AppState {
  userRequest: UserRequest;
  isLoading: boolean;
  error: string | null;
  validResponses: ValidResponse[]
}

const initialState: AppState = {
  userRequest: {
    role: "You're a language teacher who prefers using words that are similar in both languages. You enjoy teaching through proverbs, idioms, and traditional cultural tales. Your answer must follow the following json interface: { lang_code: string, text: string }[]. make sure not to deliver a markdown format but a json or a stringified json",
    scene: "dialogue between two children who are learning each other's language and meet for the first time in the house of one of the boys. they come from a different background and want to learn each other language",
    currentMessage: "the arabic speaker asks the hebrew speaker if he wants to drink tea",
    expected_response_format_to_feed_json_parse: '[{ "lang_code": "string", "text": "string" }]',
    special_notes: 'return pure text and not markdown',
    maxSentences: 10,
    minSentences: 10,
    maxWordsInSentence: 50,
    maxTotalResponseChars: 500,
    inputLanguage: 'en',
    outputLanguages: [],
  },
  isLoading: false,
  error: null,
  validResponses: [],
};

const REQUIRED_VALID_RESPONSES = 5;
const MAX_RETRIES_PER_ATTEMPT = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateResponse = (data: any): boolean => {
  if (!data || !data.result) return false;
  
  let result;
  if (typeof data.result === 'string') {
    try {
      result = JSON.parse(data.result);
    } catch {
      return false;
    }
  } else {
    result = data.result;
  }
  
  if (!Array.isArray(result)) return false;
  
  return result.every(item => 
    typeof item === 'object' &&
    item !== null &&
    'lang_code' in item &&
    'text' in item &&
    typeof item.lang_code === 'string' &&
    typeof item.text === 'string'
  );
};

export const processPrompt = createAsyncThunk(
  'prompt/process',
  async (request: { role: string, payload: string }, { dispatch }) => {
    const { role, payload } = request;
    const validResponses: Array<ValidResponse> = [];
    const bookmarkId: string = generateUUID();

    dispatch(addBookmark({ prompt: payload, id:bookmarkId }));
    
    while (validResponses.length < REQUIRED_VALID_RESPONSES) {
      let currentAttempt = 0;
      
      while (currentAttempt < MAX_RETRIES_PER_ATTEMPT) {
        try {
          const response = await sendAIRequest(url, role, payload);
          
          if (!response.success) {
            dispatch(addError({
              message: `API request failed: ${response.error}`,
              type: 'api'
            }));
            currentAttempt++;
            await sleep(RETRY_DELAY);
            continue;
          }

          if (!validateResponse(response.data)) {
            dispatch(addError({
              message: 'Invalid response format from API',
              type: 'api'
            }));
            currentAttempt++;
            await sleep(RETRY_DELAY);
            continue;
          }

          let result;
          if (typeof response.data.result === 'string') {
            result = JSON.parse(response.data.result) as Sentence[];
          } else {
            result = response.data.result  as Sentence[];
          }

          // Add to valid responses
          const responseId = generateUUID();
          const validResponse = {
            id: responseId,
            sentences: result,
            timestamp: new Date().toISOString()
          } as ValidResponse;
          validResponses.push(validResponse  );

          // Add response to the bookmark
          dispatch(addResponse({
            bookmarkId,
            validResponse  
          }));

          // Break the retry loop for this attempt
          break;
          
        } catch (error) {
          currentAttempt++;
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          
          dispatch(addError({
            message: `Attempt ${currentAttempt}: ${errorMessage}`,
            type: 'api'
          }));
          
          await sleep(RETRY_DELAY);
        }
      }
      
      // If we've exhausted retries for this attempt but still don't have enough responses,
      // continue with the next attempt
      if (currentAttempt >= MAX_RETRIES_PER_ATTEMPT) {
        dispatch(addError({
          message: `Failed to get valid response after ${MAX_RETRIES_PER_ATTEMPT} retries`,
          type: 'api'
        }));
      }
    }

    return { validResponses };
  }
);

const promptSlice = createSlice({
  name: 'prompt',
  initialState,
  reducers: {
    updateRequest: (state, action: PayloadAction<Partial<UserRequest>>) => {
      state.userRequest = { ...state.userRequest, ...action.payload };
    },
    setValidResponses: (state, action: PayloadAction<Array<ValidResponseRead>>) => {
      state.validResponses = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(processPrompt.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(processPrompt.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.validResponses) {
          state.validResponses = action.payload.validResponses;
        }
      })
      .addCase(processPrompt.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string || 'An error occurred';
      });
  },
});

export const { updateRequest, setValidResponses } = promptSlice.actions;
export default promptSlice.reducer;