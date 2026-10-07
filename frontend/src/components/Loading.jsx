import React from 'react';
import { Activity } from 'lucide-react';

export const Loading = ({ message = 'Loading healthcare operational data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[220px] p-6 text-slate-500">
      <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-teal-50 border border-teal-100 mb-3">
        <Activity className="w-7 h-7 text-teal-600 animate-pulse" />
        <span className="absolute inset-0 rounded-full border-2 border-teal-500 border-t-transparent animate-spin"></span>
      </div>
      <p className="text-sm font-medium text-slate-600 animate-pulse-subtle">{message}</p>
    </div>
  );
};

export default Loading;
