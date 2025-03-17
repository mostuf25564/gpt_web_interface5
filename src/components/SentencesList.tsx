import { useState, useRef, useEffect } from 'react';
import { FaPlay, FaStop, FaPause, FaPlayCircle } from 'react-icons/fa';
import { TranslatedSentence } from '../types/translated';
import { speakText } from '../utils/speakIt';

interface SentencesListProps {
  translations: Array<TranslatedSentence>;
  onSentencePlay?: (sentence: TranslatedSentence) => void;
  isReversed?: boolean;
  ttsSpeed?: number;
}

interface WordSpan {
  word: string;
  start: number;
  end: number;
}

interface LanguageSpeed {
  [key: string]: number;
}

interface SpeechStatus {
  isPlaying: boolean;
  currentText: string;
  currentLang: string;
  currentRate: number;
}

const COLORS = [
  'text-blue-500',
  'text-red-500',
  'text-green-500',
  'text-purple-500',
  'text-orange-500',
  'text-teal-500',
  'text-yellow-500',
  'text-pink-500'
];

const SentencesList = ({
  translations = [],
  onSentencePlay,
  isReversed = false,
  ttsSpeed = 1
}: SentencesListProps) => {
  const [activeSentenceId, setActiveSentenceId] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [wordSpans, setWordSpans] = useState<WordSpan[]>([]);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [languageSpeeds, setLanguageSpeeds] = useState<LanguageSpeed>({});
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>({
    isPlaying: false,
    currentText: '',
    currentLang: '',
    currentRate: ttsSpeed
  });

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const uniqueLanguages = Array.from(new Set(translations.map(t => t.lang_code)));

  useEffect(() => {
    return () => {
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!translations || translations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No sentences available
      </div>
    );
  }

  const splitIntoWords = (text: string): WordSpan[] => {
    const words = text.split(' ');
    let position = 0;
    return words.map(word => {
      const start = position;
      position += word.length + 1;
      return {
        word,
        start,
        end: position - 1
      };
    });
  };

  const handleSpeedChange = (langCode: string, speed: number) => {
    setLanguageSpeeds(prev => ({
      ...prev,
      [langCode]: speed
    }));
    
    if (speechStatus.currentLang === langCode && utteranceRef.current) {
      utteranceRef.current.rate = speed;
      setSpeechStatus(prev => ({
        ...prev,
        currentRate: speed
      }));
    }
  };

  const getLanguageSpeed = (langCode: string): number => {
    return languageSpeeds[langCode] || ttsSpeed;
  };

  const isRTL = (langCode: string) => {
    return ['ar', 'he', 'fa'].includes(langCode);
  };

  const handlePlaySentence = (sentence: TranslatedSentence) => {
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      utteranceRef.current = null;
    }

    setActiveSentenceId(sentence.id);
    setCurrentWordIndex(-1);

    const words = splitIntoWords(sentence.text);
    setWordSpans(words);

    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.lang = sentence.lang_code;
    const speed = getLanguageSpeed(sentence.lang_code);
    utterance.rate = speed;
    utteranceRef.current = utterance;

    setSpeechStatus({
      isPlaying: true,
      currentText: sentence.text,
      currentLang: sentence.lang_code,
      currentRate: speed
    });

    utterance.onboundary = (event) => {
      const charIndex = event.charIndex;
      const wordIndex = words.findIndex(
        span => charIndex >= span.start && charIndex <= span.end
      );
      setCurrentWordIndex(wordIndex);
    };

    utterance.onend = () => {
      setActiveSentenceId(null);
      setCurrentWordIndex(-1);
      setWordSpans([]);
      setIsPaused(false);
      setSpeechStatus({
        isPlaying: false,
        currentText: '',
        currentLang: '',
        currentRate: ttsSpeed
      });
      utteranceRef.current = null;
    };

    if (onSentencePlay) {
      onSentencePlay(sentence);
    }

    window.speechSynthesis.speak(utterance);
  };

  const handlePlayAllSentences = () => {
    window.speechSynthesis.cancel();
    if (utteranceRef.current) {
      utteranceRef.current = null;
    }

    const displayTranslations = isReversed ? [...translations].reverse() : translations;
    let currentIndex = 0;

    const playNext = () => {
      if (currentIndex < displayTranslations.length) {
        const sentence = displayTranslations[currentIndex];
        const utterance = new SpeechSynthesisUtterance(sentence.text);
        utterance.lang = sentence.lang_code;
        const speed = getLanguageSpeed(sentence.lang_code);
        utterance.rate = speed;
        utteranceRef.current = utterance;

        setSpeechStatus({
          isPlaying: true,
          currentText: sentence.text,
          currentLang: sentence.lang_code,
          currentRate: speed
        });

        const words = splitIntoWords(sentence.text);
        setActiveSentenceId(sentence.id);
        setWordSpans(words);
        setCurrentWordIndex(-1);

        utterance.onboundary = (event) => {
          const charIndex = event.charIndex;
          const wordIndex = words.findIndex(
            span => charIndex >= span.start && charIndex <= span.end
          );
          setCurrentWordIndex(wordIndex);
        };

        utterance.onend = () => {
          currentIndex++;
          if (currentIndex < displayTranslations.length) {
            playNext();
          } else {
            setActiveSentenceId(null);
            setCurrentWordIndex(-1);
            setWordSpans([]);
            setIsPaused(false);
            setSpeechStatus({
              isPlaying: false,
              currentText: '',
              currentLang: '',
              currentRate: ttsSpeed
            });
            utteranceRef.current = null;
          }
        };

        window.speechSynthesis.speak(utterance);
      }
    };

    playNext();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setActiveSentenceId(null);
    setCurrentWordIndex(-1);
    setWordSpans([]);
    setIsPaused(false);
    setSpeechStatus({
      isPlaying: false,
      currentText: '',
      currentLang: '',
      currentRate: ttsSpeed
    });
    utteranceRef.current = null;
  };

  const handlePauseResume = () => {
    if (isPaused) {
      window.speechSynthesis.resume();
      setSpeechStatus(prev => ({ ...prev, isPlaying: true }));
    } else {
      window.speechSynthesis.pause();
      setSpeechStatus(prev => ({ ...prev, isPlaying: false }));
    }
    setIsPaused(!isPaused);
  };

  const getColorByLang = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  const renderSentence = (sentence: TranslatedSentence) => {
    if (sentence.id === activeSentenceId && wordSpans.length > 0) {
      return wordSpans.map((span, index) => (
        <span
          key={index}
          className={`${index === currentWordIndex ? 'bg-yellow-200' : ''
            } transition-colors duration-200 ${getColorByLang(translations.findIndex(s => s.lang_code === sentence.lang_code))}`}
        >
          {span.word}
          {index < wordSpans.length - 1 ? ' ' : ''}
        </span>
      ));
    }
    return <span className={getColorByLang(translations.findIndex(s => s.lang_code === sentence.lang_code))}>{sentence.text}</span>;
  };

  const displayTranslations = isReversed ? [...translations].reverse() : translations;

  return (
    <div className="space-y-4">
      {/* Speech Status Display */}
      <div className="bg-gray-800 text-white p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Current Speech Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Status:</p>
            <p className={`font-medium ${speechStatus.isPlaying ? 'text-green-400' : 'text-red-400'}`}>
              {speechStatus.isPlaying ? 'Speaking' : 'Idle'}
            </p>
          </div>
          {speechStatus.isPlaying && (
            <>
              <div>
                <p className="text-gray-400">Language:</p>
                <p className="font-medium">{speechStatus.currentLang.toUpperCase()}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-400">Current Text:</p>
                <p 
                  className="font-medium"
                  dir={isRTL(speechStatus.currentLang) ? 'rtl' : 'ltr'}
                  style={{ textAlign: isRTL(speechStatus.currentLang) ? 'right' : 'left' }}
                >
                  {speechStatus.currentText}
                </p>
              </div>
              <div>
                <p className="text-gray-400">Speed:</p>
                <p className="font-medium">{speechStatus.currentRate}x</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Language Speed Controls */}
      <div className="flex flex-col space-y-4 mb-6">
        <h3 className="text-lg font-semibold">Language-specific TTS Speeds</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {uniqueLanguages.map((langCode) => (
            <div key={langCode} className="flex flex-col space-y-2 p-3 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium">
                {langCode.toUpperCase()} Speed: {getLanguageSpeed(langCode)}x
              </label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={getLanguageSpeed(langCode)}
                onChange={(e) => handleSpeedChange(langCode, parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            onClick={handleStop}
            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-colors"
          >
            <FaStop className="inline mr-1" />
          </button>
          <button
            onClick={handlePauseResume}
            className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded transition-colors"
          >
            {isPaused ? <FaPlay className="inline mr-1" /> : <FaPause className="inline mr-1" />}
          </button>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isReversed}
              onChange={() => setIsReversed(!isReversed)}
              className="form-checkbox"
            />
            <span>Reverse Order</span>
          </label>
          <button
            onClick={handlePlayAllSentences}
            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-colors"
          >
            <FaPlayCircle className="inline mr-1" />
          </button>
        </div>
      </div>

      <div className="flex flex-col space-y-2">
        {displayTranslations.map((sentence) => (
          <div
            key={sentence.id}
            className={`p-4 rounded ${activeSentenceId === sentence.id ? 'bg-blue-100' : 'bg-gray-100'
              } flex justify-between items-center transition-colors`}
            dir={isRTL(sentence.lang_code) ? 'rtl' : 'ltr'}
          >
            <span className="flex-1 text-lg">{renderSentence(sentence)}</span>
            <span 
              className="flex-1 text-lg text-gray-600 italic mx-4"
              dir="ltr"
              style={{ textAlign: isRTL(sentence.lang_code) ? 'right' : 'left' }}
            >
              {sentence.translatedText}
            </span>
            <button
              onClick={() => handlePlaySentence(sentence)}
              className={`${activeSentenceId === sentence.id
                ? 'bg-green-600'
                : 'bg-green-500 hover:bg-green-600'
                } text-white p-2 rounded transition-colors`}
              disabled={activeSentenceId !== null}
            >
              <FaPlay className="inline" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentencesList;