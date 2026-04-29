import React from 'react';
import { useBlockchainNotification } from '../context/BlockchainNotificationContext';

const GlobalBlockchainNotification = () => {
  const { notification, hideBlockchainNotification } = useBlockchainNotification();

  if (!notification.show) return null;

  const getStatusIcon = () => {
    switch (notification.status) {
      case 'pending':
        return (
          <svg className="animate-spin h-5 w-5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'success':
        return (
          <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (notification.status) {
      case 'pending': return 'border-teal-200 bg-teal-50';
      case 'success': return 'border-green-200 bg-green-50';
      case 'error': return 'border-red-200 bg-red-50';
      default: return 'border-gray-200 bg-white';
    }
  };

  const getTextColor = () => {
    switch (notification.status) {
      case 'pending': return 'text-teal-700';
      case 'success': return 'text-green-700';
      case 'error': return 'text-red-700';
      default: return 'text-gray-700';
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 rounded-lg shadow-xl border ${getStatusColor()} w-96 animate-slide-in`}>
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <p className={`text-sm font-semibold ${getTextColor()}`}>
                {notification.title}
              </p>
              <button 
                onClick={hideBlockchainNotification}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              {notification.message}
            </p>
            {notification.status === 'pending' && (
              <div className="mt-2 w-full bg-teal-100 rounded-full h-1 overflow-hidden">
                <div className="bg-teal-600 h-1 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            )}
            {notification.status === 'success' && notification.txHash && (
              <a 
                href={`https://sepolia.etherscan.io/tx/${notification.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-teal-600 hover:underline mt-2 inline-block"
              >
                Lihat transaksi di Etherscan →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalBlockchainNotification;