
import React from 'react';

const LoadingState: React.FC = () => {
  return (
    <div className="w-full space-y-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-xl bg-white border border-border animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-5 w-20 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-24 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-20 bg-gray-200 rounded"></div>
              <div className="h-5 w-36 bg-gray-200 rounded"></div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
              <div className="h-5 w-32 bg-gray-200 rounded"></div>
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-5 w-24 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LoadingState;
