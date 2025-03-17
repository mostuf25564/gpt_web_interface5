// types/promptTypes.ts

export interface LanguageOption {
  value: string;
  label: string;
}

export interface ResponseSentence {
  lang_code: string;
  text: string;
}

// types.ts

export interface UserRequest {
  currentMessage: string;
  role?: string;
  scene?: string;
  maxSentences?: number;
  minSentences?: number;
  maxWordsInSentence?: number;
  maxTotalResponseChars?: number;
  minTotalResponseChars?: number;
  inputLanguage: string;
  outputLanguages: string[];
  special_notes?: string;
  expected_response_format_to_feed_json_parse?: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export interface ControlOption {
  label: string;
  value: boolean;
  formatText: (request: Partial<UserRequest>) => string;
}

export interface ControlOptions {
  [key: string]: ControlOption;
}
