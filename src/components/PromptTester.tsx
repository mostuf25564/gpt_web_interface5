import React, { useState, useEffect, useRef } from 'react';
import { Loader2, AlertCircle, Send, MessageSquare, Code, Settings2 } from 'lucide-react';
import { AppState, processPrompt, updateRequest, UserRequest } from '../store/promptSlice';
import { useAppDispatch, useAppSelector } from '../store';
import { LanguageOption, ResponseSentence } from '../types';
import Select, { MultiValue } from 'react-select';
import CompiledRequestDisplay from './CompiledRequestDisplay';
import { useCompileRequestAndInstructions } from '../hooks/useCompileRequestAndInstructions';

interface PromptTesterProps {
  onTtsSpeedChange: (speed: number) => void;
  onReverseChange: (reversed: boolean) => void;
}

function PromptTester({ onTtsSpeedChange, onReverseChange }: PromptTesterProps) {
  const dispatch = useAppDispatch();
  const promptState = useAppSelector((state) => state.prompt as AppState);
  const [selectedOutputLanguages, setSelectedOutputLanguages] = useState<LanguageOption[]>([]);
  const [isDeveloperMode, setIsDeveloperMode] = useState(false);
  const [voices, setVoices] = useState<LanguageOption[]>([]);
  const [ttsSpeed, setTtsSpeed] = useState(1);
  const [isReversed, setIsReversed] = useState(false);

  const [enabledFields, setEnabledFields] = useState({
    currentMessage: true,
    outputLanguages: true,
    maxWordsInSentence: false,
    minSentences: false,
    maxSentences: false,
    maxTotalResponseChars: false,
    scene: false,
    special_notes: false
  });

  const { userRequest, isLoading, error } = promptState;
  const { instructions } = useCompileRequestAndInstructions(
    userRequest,
    enabledFields,
    selectedOutputLanguages
  );
  const compiledRequest = { instructions };

  // Load voices for speech synthesis
  useEffect(() => {
    const fetchVoices = () => {
      const availableVoices = speechSynthesis.getVoices();
      const defaultVoices = [
        { value: 'ar', label: 'Arabic' },
        { value: 'he', label: 'Hebrew' },
        { value: 'en', label: 'English' },
      ];
      
      const systemVoices = Array.from(new Set(availableVoices.map(voice => voice.lang)))
        .map(lang => {
          const voice = availableVoices.find(v => v.lang === lang);
          return { value: lang, label: `${voice?.lang} (${voice?.name})` };
        });

      const allVoices = [...defaultVoices, ...systemVoices].reduce((acc, current) => {
        const x = acc.find(item => item.value === current.value);
        if (!x) {
          return acc.concat([current]);
        } else {
          return acc;
        }
      }, [] as LanguageOption[]);

      setVoices(allVoices);
    };

    fetchVoices();
    window.speechSynthesis.onvoiceschanged = fetchVoices;
  }, []);

  useEffect(() => {
    onTtsSpeedChange(ttsSpeed);
  }, [ttsSpeed, onTtsSpeedChange]);

  useEffect(() => {
    onReverseChange(isReversed);
  }, [isReversed, onReverseChange]);

  const handleLanguageChange = (selectedOptions: MultiValue<LanguageOption>) => {
    setSelectedOutputLanguages(selectedOptions as LanguageOption[]);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    dispatch(updateRequest({ [name]: value } as Partial<UserRequest>));
  };

  const handleCheckboxChange = (fieldName: keyof typeof enabledFields) => {
    setEnabledFields(prev => ({
      ...prev,
      [fieldName]: !prev[fieldName]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await dispatch(processPrompt({ 
        role: userRequest.role, 
        payload: instructions 
      })).unwrap();
    } catch (error) {
      console.error('Failed to process prompt:', error);
    }
  };

  const renderField = (fieldName: keyof typeof enabledFields, label: string, component: React.ReactNode) => (
    <div className={`space-y-2 ${!isDeveloperMode && !enabledFields[fieldName] ? 'hidden' : ''}`}>
      {isDeveloperMode && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={`${fieldName}-checkbox`}
            checked={enabledFields[fieldName]}
            onChange={() => handleCheckboxChange(fieldName)}
            className="w-4 h-4 text-blue-600"
          />
          <label htmlFor={`${fieldName}-checkbox`} className="text-sm font-medium">
            {label}
          </label>
        </div>
      )}
      <div className={!enabledFields[fieldName] ? "hidden" : ""}>
        {component}
      </div>
    </div>
  );

  const renderAdvancedControls = () => {
    if (!isDeveloperMode) return null;

    return (
      <div className="space-y-4 border-t border-gray-200 pt-4 mt-4">
        <h3 className="text-lg font-semibold">Advanced Settings</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {renderField(
            'maxWordsInSentence',
            'Max Words Per Sentence',
            <input
              type="number"
              name="maxWordsInSentence"
              value={userRequest.maxWordsInSentence}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="1"
            />
          )}

          {renderField(
            'minSentences',
            'Min Sentences',
            <input
              type="number"
              name="minSentences"
              value={userRequest.minSentences}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="1"
            />
          )}

          {renderField(
            'maxSentences',
            'Max Sentences',
            <input
              type="number"
              name="maxSentences"
              value={userRequest.maxSentences}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="1"
            />
          )}

          {renderField(
            'maxTotalResponseChars',
            'Max Total Characters',
            <input
              type="number"
              name="maxTotalResponseChars"
              value={userRequest.maxTotalResponseChars}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="1"
            />
          )}

          {renderField(
            'scene',
            'Scene Description',
            <textarea
              name="scene"
              value={userRequest.scene}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          )}

          {renderField(
            'special_notes',
            'Special Notes',
            <textarea
              name="special_notes"
              value={userRequest.special_notes}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              rows={3}
            />
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-8 h-8 text-blue-600" />
          AI Language Learning Assistant
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsDeveloperMode(!isDeveloperMode)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-100 hover:bg-gray-200"
          >
            {isDeveloperMode ? <Settings2 className="w-4 h-4" /> : <Code className="w-4 h-4" />}
            {isDeveloperMode ? 'Simple Mode' : 'Developer Mode'}
          </button>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        {renderField(
          'currentMessage',
          'Your Message',
          <textarea
            name="currentMessage"
            value={userRequest.currentMessage}
            onChange={handleInputChange}
            className="w-full min-h-[100px] p-2 border rounded-md"
            placeholder="Enter your message here..."
          />
        )}

        {renderField(
          'outputLanguages',
          'Select Languages',
          <Select
            isMulti
            options={voices}
            value={selectedOutputLanguages}
            onChange={handleLanguageChange}
            className="basic-multi-select"
            classNamePrefix="select"
            placeholder="Select languages..."
          />
        )}

        {renderAdvancedControls()}

        <CompiledRequestDisplay compiledRequest={compiledRequest} />

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit
            </>
          )}
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}
      </form>
    </div>
  );
}

export default PromptTester;