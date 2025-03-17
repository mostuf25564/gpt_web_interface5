// src/hooks/useTranslation.ts
import { useEffect, useState } from 'react';
import { translate } from '../utils/translate';
import { Sentence } from '../types/sentence';

// interface Sentence {
//   id: string;
//   lang_code: string;
//   text: string;
// }

interface TranslatedSentence extends Sentence {
  translatedText: string;
}

export const useTranslation = (sentences: Array<Omit<Sentence, 'id'>>, langTo: string): Array<TranslatedSentence> => {
  const [translations, setTranslations] = useState<Array<TranslatedSentence>>([]);

  useEffect(() => {
    const translateSentences = async () => {
      const translated: Array<TranslatedSentence> = await Promise.all(
        sentences.map(async (sentence, index) => {
          const translatedText = await translate(sentence.text, sentence.lang_code, langTo); // Assuming translation to langTo
          return { ...sentence, translatedText, id: `sentence-${index + 1}` }; // Assigning an ID
        })
      );
      setTranslations(translated);
    };

    if (sentences.length > 0) {
      translateSentences();
    }
  }, [sentences, langTo]);

  return translations;
};

export default useTranslation;
