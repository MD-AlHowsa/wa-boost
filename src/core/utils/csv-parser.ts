import Papa from 'papaparse';
import { validateAndFormatPhone } from './phone-validator';
import { ImportedContact, ContactImportResult, ContactImportError } from '@/types/contact';

interface CSVRow {
  [key: string]: string;
}

/**
 * Parses a CSV file and extracts contacts
 * @param file - CSV file to parse
 * @returns Promise with import results
 */
export async function parseContactsCSV(file: File): Promise<ContactImportResult> {
  return new Promise((resolve) => {
    const errors: ContactImportError[] = [];
    const contacts: ImportedContact[] = [];
    const seenPhones = new Set<string>();
    let rowNumber = 0;

    Papa.parse<CSVRow>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      step: (row) => {
        rowNumber++;
        const data = row.data;

        try {
          // Extract phone number (try different column names)
          const phoneRaw =
            data.phone || data.phonenumber || data.mobile || data.number || data.tel;

          if (!phoneRaw) {
            errors.push({
              rowNumber,
              error: 'Phone number is required',
            });
            return;
          }

          // Validate and format phone number
          const phone = validateAndFormatPhone(phoneRaw);
          if (!phone) {
            errors.push({
              rowNumber,
              phone: phoneRaw,
              error: 'Invalid phone number format. Use international format (e.g., +1234567890)',
            });
            return;
          }

          // Check for duplicates
          if (seenPhones.has(phone)) {
            errors.push({
              rowNumber,
              phone,
              error: 'Duplicate phone number (skipping)',
            });
            return;
          }

          seenPhones.add(phone);

          // Extract other fields
          const firstName =
            data.firstname || data.first_name || data.fname || data.name?.split(' ')[0] || '';
          const lastName =
            data.lastname ||
            data.last_name ||
            data.lname ||
            data.name?.split(' ').slice(1).join(' ') ||
            '';
          const email = data.email || data.emailaddress || data.mail || '';

          // Extract custom fields (any column not recognized as standard)
          const customFields: Record<string, string> = {};
          const standardColumns = [
            'phone',
            'phonenumber',
            'mobile',
            'number',
            'tel',
            'firstname',
            'first_name',
            'fname',
            'lastname',
            'last_name',
            'lname',
            'name',
            'email',
            'emailaddress',
            'mail',
          ];

          Object.keys(data).forEach((key) => {
            if (!standardColumns.includes(key) && data[key]) {
              customFields[key] = data[key];
            }
          });

          contacts.push({
            phone,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: email.trim(),
            customFields: Object.keys(customFields).length > 0 ? customFields : undefined,
          });
        } catch (error) {
          errors.push({
            rowNumber,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      },
      complete: () => {
        resolve({
          imported: contacts.length,
          skipped: errors.length,
          errors,
        });
      },
      error: (error) => {
        resolve({
          imported: 0,
          skipped: rowNumber,
          errors: [
            {
              rowNumber: 0,
              error: `Failed to parse CSV: ${error.message}`,
            },
          ],
        });
      },
    });
  });
}

/**
 * Validates CSV file format
 * @param file - File to validate
 * @returns True if file is valid CSV
 */
export function validateCSVFile(file: File): { valid: boolean; error?: string } {
  // Check file extension
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (extension !== 'csv') {
    return {
      valid: false,
      error: 'File must be a CSV file (.csv extension)',
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit',
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  return { valid: true };
}

/**
 * Generates a sample CSV template
 * @returns CSV string template
 */
export function generateCSVTemplate(): string {
  return `phone,firstName,lastName,email,customField1
+1234567890,John,Doe,john@example.com,CustomValue1
+0987654321,Jane,Smith,jane@example.com,CustomValue2`;
}
