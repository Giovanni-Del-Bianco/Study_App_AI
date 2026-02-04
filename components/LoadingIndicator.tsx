
import React from 'react';

interface LoadingIndicatorProps {
  message: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-sky-400"></div>
      <p className="mt-6 text-lg font-semibold text-slate-200">{message}</p>
      <p className="text-sm text-slate-400 mt-1">This may take a moment...</p>
    </div>
  );
};

export default LoadingIndicator;
