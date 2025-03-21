import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import PromptTester from './components/PromptTester';
import store, { useAppSelector } from './store';
import SentencesList from './components/SentencesList';
import { useTranslation } from './hooks/useTranslation';
import LanguageSelector from './components/LanguageSelector';
import { TranslatedSentence } from './types';
import ThemeToggle from './components/ThemeToggle';
import ErrorDisplay from './components/ErrorDisplay';
import BookmarkList from './components/BookmarkList';
import Sidebar from './components/Sidebar';
import { MessageSquare, Bug } from 'lucide-react';

const App: React.FC = () => {
  const [langTo, setLangTo] = useState<string>('en');
  const [isReversed, setIsReversed] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [currentView, setCurrentView] = useState('main');

  const sentences = useAppSelector((state) => state.response.sentences);
  const selectedBookmarkResponse = useAppSelector((state) => state.response.selectedBookmarkResponse);
  const translations: TranslatedSentence[] = useTranslation(
    selectedBookmarkResponse 
      ? selectedBookmarkResponse.map((text, index) => ({
          id: `bookmark-${index}`,
          lang_code: 'auto',
          text
        }))
      : sentences, 
    langTo
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleTtsSpeedChange = (speed: number) => {
    setTtsSpeed(speed);
  };

  const handleReverseChange = (reversed: boolean) => {
    setIsReversed(reversed);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const toggleDebugMode = () => {
    setIsDebugMode(!isDebugMode);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'errors':
        if (!isDebugMode) return null;
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 dark:text-gray-100 text-gray-900">
              Error Logs
            </h2>
            <ErrorDisplay showAll />
          </div>
        );
      default:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <LanguageSelector langTo={langTo} setLangTo={setLangTo} />
              <div className="flex items-center gap-4">
                <button
                  onClick={toggleDebugMode}
                  className={`p-2 rounded-md transition-colors ${
                    isDebugMode 
                      ? 'bg-purple-600 text-white dark:bg-purple-500' 
                      : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                  }`}
                >
                  <Bug className="w-5 h-5" />
                </button>
                <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <PromptTester 
                  onTtsSpeedChange={handleTtsSpeedChange}
                  onReverseChange={handleReverseChange}
                />
                {translations.length > 0 && (
                  <SentencesList 
                    translations={translations} 
                    isReversed={isReversed}
                    ttsSpeed={ttsSpeed}
                  />
                )}
              </div>
              {/* <div>
                <BookmarkList />
              </div> */}
            </div>
          </>
        );
    }
  };

  return (
    <Provider store={store}>
      <div className={`min-h-screen transition-colors ${
        isDark 
          ? 'bg-gray-900 text-gray-100' 
          : 'bg-gray-50 text-gray-900'
      }`}>
        <Sidebar
          isDebugMode={isDebugMode}
          onViewChange={setCurrentView}
          currentView={currentView}
        />
        
        <div className="lg:ml-64">
          <div className="p-8">
            <header className="mb-8">
              <h1 
                className="text-3xl font-bold flex items-center gap-2 dark:text-gray-100 text-gray-900"
              >
                <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                AI Language Learning Assistant
              </h1>
            </header>

            {renderContent()}
          </div>
        </div>
        
        {/* <ErrorDisplay /> */}
      </div>
    </Provider>
  );
};

export default App;