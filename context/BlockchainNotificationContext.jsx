import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

const BlockchainNotificationContext = createContext();

export const useBlockchainNotification = () => {
  const context = useContext(BlockchainNotificationContext);
  if (!context) {
    throw new Error('useBlockchainNotification must be used within BlockchainNotificationProvider');
  }
  return context;
};

export const BlockchainNotificationProvider = ({ children }) => {
  const [notification, setNotification] = useState({
    show: false,
    status: null, // 'pending', 'success', 'error'
    txHash: null,
    message: null,
    title: null
  });

  // Auto hide timer
  let autoHideTimer = null;

  // Cleanup timer saat komponen unmount atau notifikasi berubah
  useEffect(() => {
    return () => {
      if (autoHideTimer) {
        clearTimeout(autoHideTimer);
      }
    };
  }, []);

  const showBlockchainNotification = useCallback((status, txHash = null, customMessage = null) => {
    // Clear timer sebelumnya jika ada
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }

    const titles = {
      pending: 'Memproses Blockchain',
      success: 'Verifikasi Berhasil',
      error: 'Verifikasi Gagal'
    };
    
    const messages = {
      pending: customMessage || 'Mengirim hash ke blockchain...',
      success: customMessage || 'Data berhasil diverifikasi di blockchain!',
      error: customMessage || 'Gagal memverifikasi data ke blockchain'
    };

    setNotification({
      show: true,
      status: status,
      txHash: txHash,
      title: titles[status],
      message: messages[status]
    });

    // Auto hide after 5 seconds for success/error, tidak untuk pending
    if (status !== 'pending') {
      autoHideTimer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
        autoHideTimer = null;
      }, 5000);
    }
  }, []);

  const hideBlockchainNotification = useCallback(() => {
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
      autoHideTimer = null;
    }
    setNotification(prev => ({ ...prev, show: false }));
  }, []);

  const updateBlockchainNotification = useCallback((status, txHash = null, customMessage = null) => {
    // Clear timer sebelumnya jika ada
    if (autoHideTimer) {
      clearTimeout(autoHideTimer);
    }

    const titles = {
      pending: 'Memproses Blockchain',
      success: 'Verifikasi Berhasil',
      error: 'Verifikasi Gagal'
    };
    
    const messages = {
      pending: customMessage || 'Mengirim hash ke blockchain...',
      success: customMessage || 'Data berhasil diverifikasi di blockchain!',
      error: customMessage || 'Gagal memverifikasi data ke blockchain'
    };

    setNotification(prev => ({
      ...prev,
      show: true,
      status: status,
      txHash: txHash,
      title: titles[status],
      message: messages[status]
    }));

    // Auto hide after 5 seconds for success/error, tidak untuk pending
    if (status !== 'pending') {
      autoHideTimer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }));
        autoHideTimer = null;
      }, 5000);
    }
  }, []);

  return (
    <BlockchainNotificationContext.Provider value={{
      notification,
      showBlockchainNotification,
      hideBlockchainNotification,
      updateBlockchainNotification
    }}>
      {children}
    </BlockchainNotificationContext.Provider>
  );
};