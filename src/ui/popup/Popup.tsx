import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { useStore } from '../store';
import { CampaignList } from '../components/CampaignList';
import { CampaignCreator } from '../components/CampaignCreator';
import './popup.css';

const Popup: React.FC = () => {
  const { campaigns, isLoading, error, loadCampaigns, loadQueueStatus, queueStatus, setError } =
    useStore();
  const [showCreator, setShowCreator] = useState(false);

  useEffect(() => {
    // Load data on mount
    loadCampaigns();
    loadQueueStatus();

    // Poll for updates
    const interval = setInterval(() => {
      loadCampaigns();
      loadQueueStatus();
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full bg-gray-50">
      {/* Header */}
      <div className="bg-whatsapp-primary text-white p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">WA Boost</h1>
            <p className="text-sm opacity-90">WhatsApp Broadcast Manager</p>
          </div>
          {!showCreator && (
            <button
              onClick={() => setShowCreator(true)}
              className="bg-white text-whatsapp-primary px-4 py-2 rounded font-medium hover:bg-gray-100 transition-colors"
            >
              + New
            </button>
          )}
        </div>
      </div>

      {/* Queue Status */}
      {queueStatus && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
          <div className="text-sm">
            {queueStatus.isProcessing ? (
              <p className="text-blue-700 font-medium">
                🟢 Processing campaign...
              </p>
            ) : (
              <p className="text-gray-600">⚪ No active campaign</p>
            )}
            {queueStatus.rateLimiterStatus && (
              <p className="text-xs text-gray-600 mt-1">
                Today: {queueStatus.rateLimiterStatus.messagesToday} /{' '}
                {queueStatus.rateLimiterStatus.dailyLimitRemaining + queueStatus.rateLimiterStatus.messagesToday} messages
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 m-4">
          <div className="flex justify-between">
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-700 font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '500px' }}>
        {showCreator ? (
          <CampaignCreator onClose={() => setShowCreator(false)} />
        ) : (
          <>
            {isLoading && campaigns.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading...</p>
              </div>
            ) : (
              <CampaignList campaigns={campaigns} />
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-white p-3 text-center text-xs text-gray-500">
        <p>
          WA Boost v1.0.0 |{' '}
          <a
            href="https://github.com/MD-AlHowsa/wa-boost"
            target="_blank"
            rel="noopener noreferrer"
            className="text-whatsapp-primary hover:underline"
          >
            GitHub
          </a>
        </p>
        <p className="mt-1">Use responsibly - respect WhatsApp ToS</p>
      </div>
    </div>
  );
};

// Initialize React app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<Popup />);
}

export default Popup;
