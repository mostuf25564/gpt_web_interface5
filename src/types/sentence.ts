import { TranslatedSentence } from "./translated";

 export interface Sentence {
  id?: string;
  lang_code: string;
  text: string;
}


export interface SentencesListProps {
  sentences?: Array<Omit<Sentence, 'id'>>;
  translations?: Array<TranslatedSentence>;
  onSentencePlay?: (sentence: Sentence) => void;
}
