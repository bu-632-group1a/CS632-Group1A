import React, { useState, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, CameraOff } from 'lucide-react';

interface QrScannerProps {
  onScan: (data: string) => void;
  onError?: (error: string) => void;
}

const QrScanner: React.FC<QrScannerProps> = ({ onScan, onError }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanner, setScanner] = useState<Html5Qrcode | null>(null);
  const [cameras, setCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    // Initialize the scanner
    const newScanner = new Html5Qrcode('reader');
    setScanner(newScanner);

    // Get available cameras
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length) {
          setCameras(devices);
          setSelectedCamera(devices[0].id);
        }
      })
      .catch((err) => {
        console.error('Error getting cameras', err);
        if (onError) onError('Could not access camera devices.');
      });

    // Cleanup on unmount
    return () => {
      if (scanner && scanner.isScanning) {
        scanner.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    if (!scanner || !selectedCamera) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    };

    scanner
      .start(
        selectedCamera,
        config,
        (decodedText) => {
          onScan(decodedText);
          // Don't stop scanning here to allow multiple scans
        },
        (errorMessage) => {
          // This is just for QR code scan failures, not critical errors
          console.log(errorMessage);
        }
      )
      .then(() => {
        setIsScanning(true);
        setPermissionDenied(false);
      })
      .catch((err) => {
        console.error('Error starting scanner', err);
        // Check if error is permission related
        if (err.toString().includes('Permission denied') || err.toString().includes('not allowed')) {
          setPermissionDenied(true);
        }
        if (onError) onError('Could not start scanning: ' + err.toString());
      });
  };

  const stopScanning = () => {
    if (scanner && isScanning) {
      scanner
        .stop()
        .then(() => {
          setIsScanning(false);
        })
        .catch((err) => {
          console.error('Error stopping scanner', err);
          if (onError) onError('Could not stop scanning: ' + err.toString());
        });
    }
  };

  const handleCameraChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCameraId = e.target.value;
    
    // Stop current scanning if active
    if (isScanning && scanner) {
      scanner.stop().then(() => {
        setSelectedCamera(newCameraId);
        setIsScanning(false);
      }).catch(console.error);
    } else {
      setSelectedCamera(newCameraId);
    }
  };

  return (
    <div className="flex flex-col items-center">
      {permissionDenied && (
        <div className="mb-4 p-4 bg-red-50 text-red-800 rounded-md">
          <p className="font-medium">Camera permission denied</p>
          <p className="text-sm">Please allow camera access to scan QR codes.</p>
        </div>
      )}

      <div id="reader" className="w-full max-w-md rounded-lg overflow-hidden"></div>

      <div className="mt-4 w-full">
        {cameras.length > 1 && (
          <div className="mb-4">
            <label htmlFor="camera-select\" className="block text-sm font-medium text-gray-700 mb-1">
              Select Camera
            </label>
            <select
              id="camera-select"
              value={selectedCamera}
              onChange={handleCameraChange}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              disabled={isScanning}
            >
              {cameras.map((camera) => (
                <option key={camera.id} value={camera.id}>
                  {camera.label || `Camera ${camera.id}`}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex space-x-4">
          {!isScanning ? (
            <button
              onClick={startScanning}
              disabled={!selectedCamera}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Camera className="h-5 w-5 mr-2" />
              Start Scanning
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <CameraOff className="h-5 w-5 mr-2" />
              Stop Scanning
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QrScanner;