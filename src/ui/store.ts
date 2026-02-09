import { create } from 'zustand';
import { Campaign } from '@/types/campaign';
import { Contact } from '@/types/contact';
import { MessageType, createMessage } from '@/shared/message-protocol';

interface AppState {
  campaigns: Campaign[];
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  queueStatus: any;

  // Actions
  loadCampaigns: () => Promise<void>;
  loadContacts: () => Promise<void>;
  createCampaign: (name: string, template: string, contacts: any[]) => Promise<Campaign>;
  startCampaign: (campaignId: string) => Promise<void>;
  pauseCampaign: (campaignId: string) => Promise<void>;
  resumeCampaign: (campaignId: string) => Promise<void>;
  stopCampaign: (campaignId: string) => Promise<void>;
  deleteCampaign: (campaignId: string) => Promise<void>;
  loadQueueStatus: () => Promise<void>;
  setError: (error: string | null) => void;
}

export const useStore = create<AppState>((set, get) => ({
  campaigns: [],
  contacts: [],
  isLoading: false,
  error: null,
  queueStatus: null,

  loadCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.GET_ALL_CAMPAIGNS, {})
      );
      if (response.success) {
        set({ campaigns: response.data || [], isLoading: false });
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load campaigns',
        isLoading: false,
      });
    }
  },

  loadContacts: async () => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.GET_CONTACTS, {})
      );
      if (response.success) {
        set({ contacts: response.data || [] });
      }
    } catch (error) {
      console.error('Failed to load contacts:', error);
    }
  },

  createCampaign: async (name, templateMessage, contacts) => {
    set({ isLoading: true, error: null });
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.CREATE_CAMPAIGN, {
          name,
          templateMessage,
          contacts,
        })
      );

      if (response.success) {
        set({ isLoading: false });
        await get().loadCampaigns();
        return response.data;
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create campaign';
      set({ error: errorMessage, isLoading: false });
      throw new Error(errorMessage);
    }
  },

  startCampaign: async (campaignId) => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.START_CAMPAIGN, { campaignId })
      );

      if (response.success) {
        await get().loadCampaigns();
        await get().loadQueueStatus();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start campaign',
      });
    }
  },

  pauseCampaign: async (campaignId) => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.PAUSE_CAMPAIGN, { campaignId })
      );

      if (response.success) {
        await get().loadCampaigns();
        await get().loadQueueStatus();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to pause campaign',
      });
    }
  },

  resumeCampaign: async (campaignId) => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.RESUME_CAMPAIGN, { campaignId })
      );

      if (response.success) {
        await get().loadCampaigns();
        await get().loadQueueStatus();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to resume campaign',
      });
    }
  },

  stopCampaign: async (campaignId) => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.STOP_CAMPAIGN, { campaignId })
      );

      if (response.success) {
        await get().loadCampaigns();
        await get().loadQueueStatus();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to stop campaign',
      });
    }
  },

  deleteCampaign: async (campaignId) => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.DELETE_CAMPAIGN, { campaignId })
      );

      if (response.success) {
        await get().loadCampaigns();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete campaign',
      });
    }
  },

  loadQueueStatus: async () => {
    try {
      const response = await chrome.runtime.sendMessage(
        createMessage(MessageType.QUEUE_STATUS, {})
      );

      if (response.success) {
        set({ queueStatus: response.data });
      }
    } catch (error) {
      console.error('Failed to load queue status:', error);
    }
  },

  setError: (error) => set({ error }),
}));
