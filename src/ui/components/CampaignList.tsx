import React from 'react';
import { Campaign } from '@/types/campaign';
import { useStore } from '../store';

interface CampaignListProps {
  campaigns: Campaign[];
}

export const CampaignList: React.FC<CampaignListProps> = ({ campaigns }) => {
  const { startCampaign, pauseCampaign, resumeCampaign, stopCampaign, deleteCampaign } =
    useStore();

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (campaigns.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No campaigns yet</p>
        <p className="text-sm mt-2">Create your first campaign to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {campaigns.map((campaign) => (
        <div key={campaign.id} className="border rounded-lg p-4 bg-white shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-lg">{campaign.name}</h3>
              <p className="text-sm text-gray-600">
                Created {formatDate(campaign.createdAt)}
              </p>
            </div>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}
            >
              {campaign.status}
            </span>
          </div>

          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="font-medium">
                {campaign.sentCount} / {campaign.totalContacts}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-whatsapp-primary h-2 rounded-full transition-all"
                style={{
                  width: `${campaign.totalContacts > 0 ? (campaign.sentCount / campaign.totalContacts) * 100 : 0}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-sm mb-3">
            <div>
              <p className="text-gray-600">Sent</p>
              <p className="font-semibold text-green-600">{campaign.sentCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Failed</p>
              <p className="font-semibold text-red-600">{campaign.failedCount}</p>
            </div>
            <div>
              <p className="text-gray-600">Pending</p>
              <p className="font-semibold text-gray-600">{campaign.pendingCount}</p>
            </div>
          </div>

          <div className="flex gap-2">
            {campaign.status === 'draft' && (
              <button
                onClick={() => startCampaign(campaign.id!)}
                className="flex-1 bg-whatsapp-primary text-white py-2 px-4 rounded hover:bg-whatsapp-dark transition-colors"
              >
                Start
              </button>
            )}

            {campaign.status === 'active' && (
              <button
                onClick={() => pauseCampaign(campaign.id!)}
                className="flex-1 bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600 transition-colors"
              >
                Pause
              </button>
            )}

            {campaign.status === 'paused' && (
              <>
                <button
                  onClick={() => resumeCampaign(campaign.id!)}
                  className="flex-1 bg-whatsapp-primary text-white py-2 px-4 rounded hover:bg-whatsapp-dark transition-colors"
                >
                  Resume
                </button>
                <button
                  onClick={() => stopCampaign(campaign.id!)}
                  className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                  Stop
                </button>
              </>
            )}

            {(campaign.status === 'completed' || campaign.status === 'failed') && (
              <button
                onClick={() => {
                  if (confirm(`Delete campaign "${campaign.name}"?`)) {
                    deleteCampaign(campaign.id!);
                  }
                }}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
