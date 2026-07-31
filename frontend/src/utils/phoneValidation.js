export const countryCodes = [
  { code: '+62', country: 'Indonesia (ID)', min: 9, max: 13 },
  { code: '+86', country: 'China (CN)', min: 11, max: 11 },
  { code: '+234', country: 'Nigeria (NG)', min: 10, max: 11 },
  { code: '+27', country: 'South Africa (ZA)', min: 9, max: 9 },
  { code: '+1', country: 'United States (US)', min: 10, max: 10 },
  { code: '+65', country: 'Singapore (SG)', min: 8, max: 8 },
  { code: '+60', country: 'Malaysia (MY)', min: 9, max: 10 },
];

export const validatePhone = (phone, countryCode) => {
  if (!phone || !countryCode) return 'Please enter a valid phone number and select a country code.';
  
  const selectedCountry = countryCodes.find(c => c.code === countryCode);
  if (!selectedCountry) return 'Invalid country code.';

  // Remove any non-numeric characters (like spaces, dashes) for length checking
  const numericPhone = phone.replace(/\D/g, '');

  if (numericPhone.length < selectedCountry.min || numericPhone.length > selectedCountry.max) {
    return `Invalid phone number. For ${selectedCountry.country}, the number must be between ${selectedCountry.min} and ${selectedCountry.max} digits.`;
  }
  return null; // Valid
};
