import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-4 sm:p-8 rounded-lg shadow-lg flex flex-col items-center max-w-xs sm:max-w-md">
        {/* Spinner */}
        <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-danger mb-3 sm:mb-4"></div>

        {/* Loading Text */}
        <p className="text-gray-700 font-semibold text-sm sm:text-lg text-center mb-3 sm:mb-4">
          Please wait, we are processing your request...
        </p>

        {/* Bouncing Dots */}
        <div className="flex space-x-2 mt-6">
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-danger rounded-full animate-bounce"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-danger rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 sm:w-3 sm:h-3 bg-danger rounded-full animate-bounce delay-200"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;