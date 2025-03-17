
// src/store/types.ts

export interface UserRequest {
  role: string;
  scene: string;
  currentMessage: string;
  expected_response_format_to_feed_json_parse: string;
  special_notes: string;
  maxSentences: number;
  minSentences: number;
  maxWordsInSentence: number;
  maxTotalResponseChars: number;
  inputLanguage: string;
  outputLanguages: string[];
  url: string;
}
