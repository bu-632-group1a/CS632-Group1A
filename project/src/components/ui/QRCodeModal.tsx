import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Printer as Print, QrCode, ExternalLink } from 'lucide-react';
import Button from './Button';
import { Session } from '../../types';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: Session;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ isOpen, onClose, session }) => {
  // Generate the correct check-in URL
  const getCheckInUrl = () => {
    // In development, use localhost
    if (import.meta.env.DEV) {
      return `${window.location.origin}/check-in?session=${session.id}&auto=true`;
    }
    
    // In production, use the actual deployed URL
    // You can set this as an environment variable VITE_APP_URL
    const deployedUrl = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${deployedUrl}/check-in?session=${session.id}&auto=true`;
  };

  const checkInUrl = getCheckInUrl();
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(checkInUrl)}`;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>QR Code - ${session.title}</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                text-align: center;
                padding: 40px;
                margin: 0;
              }
              .qr-container {
                max-width: 400px;
                margin: 0 auto;
                border: 2px solid #e5e7eb;
                border-radius: 12px;
                padding: 30px;
                background: white;
              }
              .qr-code {
                width: 250px;
                height: 250px;
                margin: 20px auto;
                border: 1px solid #d1d5db;
                border-radius: 8px;
              }
              .session-title {
                font-size: 24px;
                font-weight: bold;
                color: #111827;
                margin-bottom: 10px;
              }
              .session-details {
                color: #6b7280;
                margin-bottom: 20px;
                line-height: 1.5;
              }
              .instructions {
                font-size: 14px;
                color: #374151;
                margin-top: 20px;
                padding: 15px;
                background: #f9fafb;
                border-radius: 8px;
              }
              .url-info {
                font-size: 12px;
                color: #6b7280;
                margin-top: 15px;
                word-break: break-all;
                background: #f3f4f6;
                padding: 10px;
                border-radius: 6px;
              }
              @media print {
                body { padding: 20px; }
                .qr-container { border: 2px solid #000; }
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1 class="session-title">${session.title}</h1>
              <div class="session-details">
                <div><strong>Time:</strong> ${session.time}</div>
                <div><strong>Location:</strong> ${session.location}</div>
                <div><strong>Speaker:</strong> ${session.speaker}</div>
              </div>
              <img src="${qrCodeUrl}" alt="QR Code for ${session.title}" class="qr-code" />
              <div class="instructions">
                <strong>How to use:</strong><br>
                1. Scan this QR code with your phone camera<br>
                2. Tap the link that appears<br>
                3. You'll be automatically checked in to this session
              </div>
              <div class="url-info">
                <strong>Direct link:</strong><br>
                ${checkInUrl}
              </div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = qrCodeUrl;
    link.download = `qr-code-${session.id}-${session.title.replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTestLink = () => {
    window.open(checkInUrl, '_blank');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-full mr-3">
                  <QrCode size={20} className="text-primary-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Session QR Code</h3>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Session Info */}
              <div className="mb-6">
                <h4 className="font-bold text-gray-900 mb-2">{session.title}</h4>
                <div className="space-y-1 text-sm text-gray-600">
                  <div><strong>Time:</strong> {session.time}</div>
                  <div><strong>Location:</strong> {session.location}</div>
                  <div><strong>Speaker:</strong> {session.speaker}</div>
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center mb-6">
                <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img 
                    src={qrCodeUrl} 
                    alt={`QR Code for ${session.title}`}
                    className="w-48 h-48 mx-auto"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkVycm9yIGxvYWRpbmcgUVIgQ29kZTwvdGV4dD48L3N2Zz4=';
                    }}
                  />
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h5 className="font-medium text-blue-900 mb-2">How to use this QR code:</h5>
                <ol className="text-sm text-blue-800 space-y-1">
                  <li>1. Print this QR code or display it on a screen</li>
                  <li>2. Attendees can scan it with their phone camera</li>
                  <li>3. They'll be taken directly to the check-in page</li>
                  <li>4. Check-in will be automatic when they visit the link</li>
                </ol>
              </div>

              {/* URL Display */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Check-in URL:
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <code className="text-xs text-gray-800 break-all">{checkInUrl}</code>
                </div>
                <div className="mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestLink}
                    icon={<ExternalLink size={16} />}
                    className="text-xs"
                  >
                    Test Link
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  icon={<Download size={18} />}
                  className="flex-1"
                >
                  Download
                </Button>
                <Button
                  variant="primary"
                  onClick={handlePrint}
                  icon={<Print size={18} />}
                  className="flex-1"
                >
                  Print
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QRCodeModal;