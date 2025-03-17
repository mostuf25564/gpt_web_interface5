import React, { useState, useEffect } from 'react';
import { Menu, X, AlertTriangle, MessageSquare, Clock } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { updateResponseSentences } from '../store/responseSlice';

interface SidebarProps {
  isDebugMode: boolean;
  onViewChange: (view: string) => void;
  currentView: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isDebugMode, onViewChange, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const errors = useAppSelector(state => state.errors.errors);
  const validResponses = useAppSelector(state => state.prompt.validResponses);
  const dispatch = useAppDispatch();

  const handleResponseClick = (response: any) => {
    if (response.result) {
      dispatch(updateResponseSentences(response.result));
      setIsOpen(false); // Close sidebar on mobile after selection
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-md bg-gray-800 text-gray-100"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      <div
        className={`fixed top-0 left-0 h-full bg-gray-800 shadow-lg transform transition-transform duration-300 z-40 
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 w-64 overflow-y-auto`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-100">Navigation</h2>
          </div>

          <nav className="space-y-4">
            <button
              onClick={() => {
                onViewChange('main');
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                ${currentView === 'main' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-gray-700'}`}
            >
              <MessageSquare className="w-5 h-5" />
              Main View
            </button>

            {isDebugMode && (
              <button
                onClick={() => {
                  onViewChange('errors');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${currentView === 'errors' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'}`}
              >
                <AlertTriangle className="w-5 h-5" />
                Error Logs
                {errors.length > 0 && (
                  <span className="ml-auto bg-red-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {errors.length}
                  </span>
                )}
              </button>
            )}

            {/* Validated Responses Section */}
            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-gray-100 mb-3 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Validated Responses
                {validResponses.length > 0 && (
                  <span className="ml-auto bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs">
                    {validResponses.length}
                  </span>
                )}
              </h3>
              <div className="space-y-2">
                {validResponses.length === 0 ? (
                  <p className="text-gray-400 text-sm italic px-4">
                    No validated responses yet
                  </p>
                ) : (
                  validResponses.map((response) => (
                    <button
                      key={response.id}
                      onClick={() => handleResponseClick(response)}
                      className="w-full text-left p-3 rounded-md transition-colors hover:bg-gray-700 text-gray-300 hover:text-white border border-gray-700"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-medium">
                          Response #{response.id.slice(0, 8)}
                        </span>
                        <span className="text-xs text-gray-400">
                          {new Date(response.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </nav>
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;