import React, { useEffect } from 'react';

const ToastNotification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : '⟳';

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-in`}>
      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
        {icon}
      </div>
      <p className="text-sm">{message}</p>
      <button onClick={onClose} className="ml-2 text-white/80 hover:text-white">
        ×
      </button>
    </div>
  );
};

export default ToastNotification;