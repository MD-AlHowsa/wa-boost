import React, { useState, useRef } from 'react';
import { parseContactsCSV, validateCSVFile } from '@/core/utils/csv-parser';
import { ImportedContact, ContactImportResult } from '@/types/contact';

interface ContactImporterProps {
  onImport: (contacts: ImportedContact[]) => void;
}

export const ContactImporter: React.FC<ContactImporterProps> = ({ onImport }) => {
  const [importResult, setImportResult] = useState<ContactImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  // const [contacts, setContacts] = useState<ImportedContact[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateCSVFile(file);
    if (!validation.valid) {
      alert(validation.error);
      return;
    }

    setIsProcessing(true);

    try {
      const result = await parseContactsCSV(file);
      setImportResult(result);

      // Show import results
      if (result.errors.length > 0) {
        console.log('Import errors:', result.errors);
      }

      alert(
        `Import complete!\n\nImported: ${result.imported}\nSkipped: ${result.skipped}\n\n${result.errors.length > 0 ? 'Check console for errors' : ''}`
      );

      // Note: We can't access the actual imported contacts from the result
      // This is a limitation of the current parseContactsCSV implementation
      // For now, we'll just notify that contacts were imported
    } catch (error) {
      alert(`Failed to import contacts: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <div>
        <button
          onClick={handleUploadClick}
          disabled={isProcessing}
          className="w-full bg-whatsapp-primary text-white py-3 px-4 rounded hover:bg-whatsapp-dark transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Importing...' : 'Upload CSV File'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="text-sm text-gray-600">
        <p className="font-medium mb-2">CSV Format Requirements:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Required column: phone (in international format, e.g., +1234567890)</li>
          <li>Optional columns: firstName, lastName, email</li>
          <li>Any additional columns will be treated as custom fields</li>
        </ul>
      </div>

      {importResult && (
        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="font-medium text-sm mb-2">Import Summary:</p>
          <div className="text-sm space-y-1">
            <p className="text-green-600">✓ Imported: {importResult.imported}</p>
            <p className="text-yellow-600">⚠ Skipped: {importResult.skipped}</p>
            {importResult.errors.length > 0 && (
              <p className="text-red-600">✗ Errors: {importResult.errors.length}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
