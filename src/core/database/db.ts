import Dexie, { Table } from 'dexie';
import { Campaign } from '@/types/campaign';
import { Contact } from '@/types/contact';
import { BroadcastMessage } from '@/types/message';
import { AnalyticsEvent } from './schema';
import { DB_NAME, DB_VERSION } from '@/shared/constants';

export class WhatsAppBroadcastDB extends Dexie {
  campaigns!: Table<Campaign, string>;
  contacts!: Table<Contact, string>;
  messages!: Table<BroadcastMessage, string>;
  analytics!: Table<AnalyticsEvent, string>;

  constructor() {
    super(DB_NAME);

    // Define database schema
    this.version(DB_VERSION).stores({
      campaigns: 'id, status, createdAt, startedAt, updatedAt',
      contacts: 'id, &phone, lastContactedAt, *campaignIds, *tags',
      messages: 'id, campaignId, contactId, status, sentAt, [campaignId+status]',
      analytics: 'id, campaignId, eventType, timestamp',
    });

    // Add hooks for automatic timestamps
    this.campaigns.hook('creating', (primKey, obj) => {
      if (!obj.createdAt) obj.createdAt = Date.now();
      if (!obj.updatedAt) obj.updatedAt = Date.now();
    });

    this.campaigns.hook('updating', (modifications, primKey, obj) => {
      modifications.updatedAt = Date.now();
      return modifications;
    });

    this.contacts.hook('creating', (primKey, obj) => {
      if (!obj.createdAt) obj.createdAt = Date.now();
      if (!obj.updatedAt) obj.updatedAt = Date.now();
    });

    this.contacts.hook('updating', (modifications, primKey, obj) => {
      modifications.updatedAt = Date.now();
      return modifications;
    });
  }
}

// Create singleton instance
export const db = new WhatsAppBroadcastDB();
