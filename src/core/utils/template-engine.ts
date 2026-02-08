import { Contact } from '@/types/contact';

/**
 * Substitutes template variables in a message template
 * @param template - Message template with {{variable}} placeholders
 * @param contact - Contact data to substitute
 * @returns Message with variables replaced
 */
export function substituteTemplate(template: string, contact: Contact): string {
  let message = template;

  // Replace standard variables
  message = message.replace(/\{\{firstName\}\}/gi, contact.firstName || '');
  message = message.replace(/\{\{lastName\}\}/gi, contact.lastName || '');
  message = message.replace(/\{\{phone\}\}/gi, contact.phone || '');
  message = message.replace(/\{\{email\}\}/gi, contact.email || '');

  // Replace custom fields
  if (contact.customFields) {
    Object.entries(contact.customFields).forEach(([key, value]) => {
      const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'gi');
      message = message.replace(regex, value || '');
    });
  }

  return message.trim();
}

/**
 * Extracts all template variables from a message template
 * @param template - Message template
 * @returns Array of variable names found in the template
 */
export function extractTemplateVariables(template: string): string[] {
  const regex = /\{\{([^}]+)\}\}/g;
  const variables: string[] = [];
  let match;

  while ((match = regex.exec(template)) !== null) {
    variables.push(match[1].trim());
  }

  return [...new Set(variables)]; // Remove duplicates
}

/**
 * Validates that all required variables are present in contact data
 * @param template - Message template
 * @param contact - Contact data
 * @returns Object with validation result and missing variables
 */
export function validateTemplateVariables(
  template: string,
  contact: Contact
): { valid: boolean; missingVariables: string[] } {
  const variables = extractTemplateVariables(template);
  const missingVariables: string[] = [];

  const standardFields = {
    firstName: contact.firstName,
    lastName: contact.lastName,
    phone: contact.phone,
    email: contact.email,
  };

  variables.forEach((variable) => {
    const lowerVar = variable.toLowerCase();

    // Check standard fields
    if (lowerVar in standardFields) {
      if (!standardFields[lowerVar as keyof typeof standardFields]) {
        missingVariables.push(variable);
      }
    }
    // Check custom fields
    else if (!contact.customFields || !contact.customFields[variable]) {
      missingVariables.push(variable);
    }
  });

  return {
    valid: missingVariables.length === 0,
    missingVariables,
  };
}

/**
 * Preview a message with substituted variables
 * @param template - Message template
 * @param contact - Contact data
 * @returns Preview of the message with variables substituted
 */
export function previewMessage(template: string, contact: Contact): string {
  return substituteTemplate(template, contact);
}
