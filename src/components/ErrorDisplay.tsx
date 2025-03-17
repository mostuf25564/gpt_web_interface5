import React from 'react';
import { XCircle } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../store';
import { clearError, clearAllErrors } from '../store/errorSlice';

interface ErrorDisplayProps {
  showAll?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ showAll = false }) => {
  const errors = useAppSelector(state => state.errors.errors);
  const dispatch = useAppDispatch();

  if (errors.length === 0) {
    if (showAll) {
      return (
        <div className="text-center text-gray-500 dark:text-gray-400 py-8">
          No errors to display
        </div>
      );
    }
    return null;
  }

  const ErrorList = () => (
    <div className="space-y-2 max-h-96 overflow-y-auto">
      {errors.map(error => (
        <div
          key={error.id}
          className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-md"
        >
          <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                {error.type.toUpperCase()}
              </p>
              <button
                onClick={() => dispatch(clearError(error.id))}
                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-red-700 dark:text-red-300">{error.message}</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {new Date(error.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );

  if (showAll) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            System Errors ({errors.length})
          </h3>
          <button
            onClick={() => dispatch(clearAllErrors())}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear All
          </button>
        </div>
        <ErrorList />
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md w-full z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">
            System Errors ({errors.length})
          </h3>
          <button
            onClick={() => dispatch(clearAllErrors())}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear All
          </button>
        </div>
        <ErrorList />
      </div>
    </div>
  );
};

export default ErrorDisplay;