import React from 'react';

interface CompiledRequest {
  instructions: string;
}

interface CompiledRequestDisplayProps {
  compiledRequest: CompiledRequest;
}

const CompiledRequestDisplay: React.FC<CompiledRequestDisplayProps> = ({ compiledRequest }) => {
  return (
    <div className="p-4 border border-gray-300 dark:border-gray-700 rounded-md shadow-md bg-white dark:bg-gray-800">
      <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">Compiled Instructions</h2>
      <p className="text-gray-700 dark:text-gray-300">{compiledRequest.instructions}</p>
    </div>
  );
};

export default CompiledRequestDisplay;