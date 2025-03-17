import { Sentence } from "./sentence";

export interface TranslatedSentence extends Sentence {
  translatedText: string;
}
