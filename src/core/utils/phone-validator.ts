import { parsePhoneNumber, isValidPhoneNumber, CountryCode } from 'libphonenumber-js';

/**
 * Validates and formats a phone number to E.164 format
 * @param phone - Phone number in any format
 * @param defaultCountry - Default country code (optional)
 * @returns Formatted phone number in E.164 format or null if invalid
 */
export function validateAndFormatPhone(
  phone: string,
  defaultCountry?: CountryCode
): string | null {
  try {
    // Remove common formatting characters
    let cleaned = phone.trim().replace(/[\s\-\(\)\.]/g, '');

    // Add + if missing and phone starts with a digit
    if (!cleaned.startsWith('+') && /^\d/.test(cleaned)) {
      cleaned = '+' + cleaned;
    }

    // Validate using libphonenumber-js
    if (!isValidPhoneNumber(cleaned, defaultCountry)) {
      return null;
    }

    // Parse and format to E.164
    const phoneNumber = parsePhoneNumber(cleaned, defaultCountry);
    if (!phoneNumber) {
      return null;
    }

    return phoneNumber.format('E.164');
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a phone number is valid
 * @param phone - Phone number to validate
 * @param defaultCountry - Default country code (optional)
 * @returns True if valid, false otherwise
 */
export function isPhoneValid(phone: string, defaultCountry?: CountryCode): boolean {
  return validateAndFormatPhone(phone, defaultCountry) !== null;
}

/**
 * Formats a phone number for display (national format)
 * @param phone - Phone number in E.164 format
 * @returns Formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (!phoneNumber) {
      return phone;
    }
    return phoneNumber.formatNational();
  } catch (error) {
    return phone;
  }
}
