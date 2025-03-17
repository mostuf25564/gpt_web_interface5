import React from 'react';

interface LanguageSelectorProps {
  langTo: string;
  setLangTo: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ langTo, setLangTo }) => {
  const languages = [
    { code: 'ar', label: 'Arabic' },
    { code: 'he', label: 'Hebrew' },
    { code: 'ti', label: 'Tigrinya1' },
    { code: 'tir', label: 'Tigrinya2' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Spanish' },
    { code: 'fr', label: 'French' },
    { code: 'de', label: 'German' },
    { code: 'zh', label: 'Chinese' },
  ];

  return (
    <div className="mb-4">
      <label htmlFor="language-select" className="mr-2 text-gray-700 dark:text-gray-200">
        Select Your Language:{' '}
      </label>
      <select
        id="language-select"
        value={langTo}
        onChange={(e) => setLangTo(e.target.value)}
        className="border p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700"
      >
        {languages.map((language) => (
          <option key={language.code} value={language.code}>
            {language.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSelector