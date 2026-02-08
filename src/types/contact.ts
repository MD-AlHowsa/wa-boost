export interface Contact {
  id: string; // UUID
  phone: string; // E.164 format: +1234567890
  firstName?: string;
  lastName?: string;
  email?: string;
  customFields: Record<string, string>; // For template variables
  tags: string[];
  createdAt: number;
  updatedAt: number;
  lastContactedAt?: number;
  campaignIds: string[]; // Many-to-many relationship
  isBlocked: boolean;
}

export interface ImportedContact {
  phone: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  customFields?: Record<string, string>;
}

export interface ContactImportResult {
  imported: number;
  skipped: number;
  errors: ContactImportError[];
}

export interface ContactImportError {
  rowNumber: number;
  phone?: string;
  error: string;
}
