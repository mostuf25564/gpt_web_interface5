import { useMemo } from 'react';
import { UserRequest, LanguageOption } from '../types/types'; // Ensure the path is correct

interface CompileResult {
  instructions: string;
}

export function useCompileRequestAndInstructions(
  userRequest: UserRequest,
  enabledFields: Record<string, boolean>,
  selectedOutputLanguages: LanguageOption[]
): CompileResult {
  // Memoize the result to avoid unnecessary recalculations
  return useMemo(() => {
    const instructionParts: string[] = [];

    // Process each enabled field into a natural language instruction
    Object.entries(enabledFields).forEach(([key, enabled]) => {
      if (!enabled) return;

      switch (key) {
        case 'currentMessage': {
          instructionParts.push(`please generate such dialog: "${userRequest.currentMessage}"`);
          break;
        }
        // case 'role': {
        //   if (userRequest.role) {
        //     instructionParts.push(`Act as: ${userRequest.role}`);
        //   }
        //   break;
        // }
        case 'scene': {
          if (userRequest.scene) {
            instructionParts.push(`Context: ${userRequest.scene}`);
          }
          break;
        }
        case 'minTotalResponseChars': {
          instructionParts.push(`Use at least ${userRequest.minTotalResponseChars} characters`);
          break;
        }
        case 'maxTotalResponseChars': {
          instructionParts.push(`Use no more than ${userRequest.maxTotalResponseChars} characters`);
          break;
        }
        case 'minSentences': {
          instructionParts.push(`Include at least ${userRequest.minSentences} sentences`);
          break;
        }
        case 'maxSentences': {
          instructionParts.push(`Include no more than ${userRequest.maxSentences} sentences`);
          break;
        }
        case 'maxWordsInSentence': {
          instructionParts.push(`Keep each sentence under ${userRequest.maxWordsInSentence} words`);
          break;
        }
        case 'outputLanguages': {

          const languages = selectedOutputLanguages.map(lang => lang.value).join(', ');
          instructionParts.push(`Use the following languages (each person know only one language and tries to communicate with it): ${languages}`);
          break;
        }
        case 'special_notes': {
          if (userRequest.special_notes) {
            instructionParts.push(`Additional notes: ${userRequest.special_notes}`);
          }
          break;
        }
      }
    });

    return {
      instructions: instructionParts.join('. ') + '.',
    };
  }, [userRequest, enabledFields, selectedOutputLanguages]);
}
