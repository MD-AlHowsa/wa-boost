import React, { useState } from 'react';
import { ContactImporter } from './ContactImporter';
import { ImportedContact } from '@/types/contact';
import { useStore } from '../store';
import { extractTemplateVariables } from '@/core/utils/template-engine';

interface CampaignCreatorProps {
  onClose: () => void;
}

export const CampaignCreator: React.FC<CampaignCreatorProps> = ({ onClose }) => {
  const { createCampaign } = useStore();
  const [campaignName, setCampaignName] = useState('');
  const [templateMessage, setTemplateMessage] = useState('');
  const [contacts, setContacts] = useState<ImportedContact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const variables = extractTemplateVariables(templateMessage);

  const handleImport = (importedContacts: ImportedContact[]) => {
    setContacts(importedContacts);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!campaignName.trim()) {
      alert('Please enter a campaign name');
      return;
    }

    if (!templateMessage.trim()) {
      alert('Please enter a message template');
      return;
    }

    if (contacts.length === 0) {
      alert('Please import contacts first');
      return;
    }

    setIsSubmitting(true);

    try {
      await createCampaign(campaignName, templateMessage, contacts);
      alert('Campaign created successfully!');
      onClose();
    } catch (error) {
      alert(
        `Failed to create campaign: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertVariable = (variable: string) => {
    setTemplateMessage((prev) => prev + `{{${variable}}}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Create Campaign</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-2xl"
        >
          ×
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Campaign Name</label>
          <input
            type="text"
            value={campaignName}
            onChange={(e) => setCampaignName(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-primary"
            placeholder="e.g., Summer Sale 2026"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message Template</label>
          <textarea
            value={templateMessage}
            onChange={(e) => setTemplateMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-whatsapp-primary resize-none"
            placeholder="Hi {{firstName}}, this is your personalized message..."
          />
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => insertVariable('firstName')}
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              + firstName
            </button>
            <button
              type="button"
              onClick={() => insertVariable('lastName')}
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              + lastName
            </button>
            <button
              type="button"
              onClick={() => insertVariable('phone')}
              className="px-2 py-1 bg-gray-100 text-sm rounded hover:bg-gray-200"
            >
              + phone
            </button>
          </div>
          {variables.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Variables in template: {variables.join(', ')}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Import Contacts</label>
          <ContactImporter onImport={handleImport} />
          {contacts.length > 0 && (
            <p className="text-sm text-green-600 mt-2">
              ✓ {contacts.length} contacts ready
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 bg-whatsapp-primary text-white py-2 px-4 rounded hover:bg-whatsapp-dark transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Campaign'}
          </button>
        </div>
      </form>
    </div>
  );
};
