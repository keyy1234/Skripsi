import React, { useRef, useEffect } from 'react';
import QRCode from 'qrcode';

const ProfessionalQRCode = ({ 
  data, 
  size = 120,
  bgColor = "#ffffff",
  fgColor = "#0d9488",
  showLabel = false,
  label = "Scan QR Code"
}) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (data && canvasRef.current) {
      const qrData = typeof data === 'object' ? JSON.stringify(data) : String(data);
      
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor
        }
      }, (error) => {
        if (error) console.error('QR Code error:', error);
      });
    }
  }, [data, size, bgColor, fgColor]);

  // Jika tidak ada data, tampilkan placeholder
  if (!data) {
    return (
      <div 
        className="bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200">
        <canvas ref={canvasRef} width={size} height={size} />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-2">{label}</p>
      )}
    </div>
  );
};

export default ProfessionalQRCode;