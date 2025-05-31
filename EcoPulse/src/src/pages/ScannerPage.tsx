import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import QrScanner from '../components/scanner/QrScanner';
import { useEvent } from '../contexts/EventContext';
import { useSustainability } from '../contexts/SustainabilityContext';
import { motion } from 'framer-motion';

const ScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanStatus, setScanStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const { checkInSession, sessions } = useEvent();
  const { logAction } = useSustainability();
  const navigate = useNavigate();

  const handleScan = async (data: string) => {
    if (isProcessing) return; // Prevent multiple rapid scans

    setIsProcessing(true);
    setScanResult(data);

    try {
      // Check if the QR code contains a valid session ID
      // Expected format: ecopulse:session:{sessionId}
      if (data.startsWith('ecopulse:session:')) {
        const sessionId = data.split(':')[2];
        const session = sessions.find(s => s.id === sessionId);
        
        if (session) {
          // Attempt to check in
          await checkInSession(sessionId, data);
          
          // Log a digital materials sustainability action
          await logAction('digital_materials', 'Used QR code check-in instead of paper');
          
          setScanStatus('success');
          setStatusMessage(`Successfully checked in to: ${session.title}`);
          
          // Navigate to session detail after a brief delay
          setTimeout(() => {
            navigate(`/sessions/${sessionId}`);
          }, 2000);
        } else {
          setScanStatus('error');
          setStatusMessage('Session not found. Please try scanning again.');
        }
      } else {
        setScanStatus('error');
        setStatusMessage('Invalid QR code format. Please scan a valid session QR code.');
      }
    } catch (error) {
      setScanStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Failed to process QR code');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleError = (error: string) => {
    setScanStatus('error');
    setStatusMessage(`Scanner error: ${error}`);
  };

  const resetScan = () => {
    setScanResult(null);
    setScanStatus(null);
    setStatusMessage('');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <QrCode className="h-6 w-6 mr-2 text-primary-600" />
          QR Code Scanner
        </h1>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-4 py-5 sm:p-6">
          <p className="text-sm text-gray-500 mb-6">
            Scan the QR code displayed at session entrances to check in and track your attendance.
          </p>

          {scanStatus ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`p-4 ${
                scanStatus === 'success' ? 'bg-green-50' : 'bg-red-50'
              } rounded-md mb-6`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  {scanStatus === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    scanStatus === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {statusMessage}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : null}

          <QrScanner onScan={handleScan} onError={handleError} />

          {scanStatus && (
            <div className="mt-4 text-center">
              <button
                onClick={resetScan}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Scan Another Code
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">How to use the scanner</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2 rounded-full bg-primary-100 text-primary-600">1</span>
              Point your camera at the session QR code displayed at the entrance.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2 rounded-full bg-primary-100 text-primary-600">2</span>
              Hold steady until the code is recognized.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2 rounded-full bg-primary-100 text-primary-600">3</span>
              You'll be automatically checked in to the session and redirected to the session details.
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 h-5 w-5 flex items-center justify-center mr-2 rounded-full bg-primary-100 text-primary-600">4</span>
              Earn sustainability points for using digital check-in!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;