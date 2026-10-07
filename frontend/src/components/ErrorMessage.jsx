import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const ErrorMessage = ({ message, onRetry, title = 'Operation Notice' }) => {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 text-rose-900 shadow-sm my-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 text-sm">
          <h4 className="font-semibold text-rose-950 mb-0.5">{title}</h4>
          <p className="text-rose-800 leading-relaxed">{message}</p>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
