import { db } from '../db';
import { Contact } from '@/types/contact';
import { v4 as uuidv4 } from 'uuid';

export class ContactRepository {
  async create(contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> {
    const newContact: Contact = {
      ...contact,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await db.contacts.add(newContact);
    return newContact;
  }

  async createMany(contacts: Array<Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Contact[]> {
    const newContacts: Contact[] = contacts.map((contact) => ({
      ...contact,
      id: uuidv4(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }));

    await db.contacts.bulkAdd(newContacts);
    return newContacts;
  }

  async getById(id: string): Promise<Contact | undefined> {
    return await db.contacts.get(id);
  }

  async getByPhone(phone: string): Promise<Contact | undefined> {
    return await db.contacts.where('phone').equals(phone).first();
  }

  async getAll(): Promise<Contact[]> {
    return await db.contacts.toArray();
  }

  async getByCampaign(campaignId: string): Promise<Contact[]> {
    return await db.contacts.where('campaignIds').equals(campaignId).toArray();
  }

  async update(id: string, updates: Partial<Contact>): Promise<void> {
    await db.contacts.update(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  }

  async delete(id: string): Promise<void> {
    await db.contacts.delete(id);
  }

  async addCampaignToContact(contactId: string, campaignId: string): Promise<void> {
    const contact = await this.getById(contactId);
    if (contact && !contact.campaignIds.includes(campaignId)) {
      await this.update(contactId, {
        campaignIds: [...contact.campaignIds, campaignId],
      });
    }
  }

  async updateLastContacted(contactId: string): Promise<void> {
    await this.update(contactId, {
      lastContactedAt: Date.now(),
    });
  }

  async findOrCreate(
    phone: string,
    data: Partial<Omit<Contact, 'id' | 'phone' | 'createdAt' | 'updatedAt'>>
  ): Promise<Contact> {
    const existing = await this.getByPhone(phone);
    if (existing) {
      return existing;
    }

    return await this.create({
      phone,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      customFields: data.customFields || {},
      tags: data.tags || [],
      campaignIds: data.campaignIds || [],
      isBlocked: data.isBlocked || false,
    });
  }
}

export const contactRepository = new ContactRepository();
