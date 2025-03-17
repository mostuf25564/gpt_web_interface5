export const speakText = (text: string, langCode: string, rate: number = 1) => {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = rate;
  window.speechSynthesis.speak(utterance);
};