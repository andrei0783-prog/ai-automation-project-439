const placeholders = ['-', '—', 'n/a', 'null'];

const cleanValue = (value) => {
  const text = String(value ?? '').trim();
  return placeholders.includes(text.toLowerCase()) ? '' : text;
};

export const normalizePhone = (value) => {
  const text = cleanValue(value);
  if (text === '') return '';
  const digits = text.replace(/[^0-9]/g, '');
  if (digits.length === 10) return `7${digits}`;
  if (digits.length === 11) return `7${digits.slice(1)}`;
  return null;
};

export const normalizeEmail = (value) => {
  const text = cleanValue(value).toLowerCase();
  if (text === '') return '';
  const parts = text.split('@');
  return parts.length === 2 && parts.every((part) => part !== '') ? text : null;
};

export const normalizeName = (value) => cleanValue(value)
  .split(' ')
  .filter((part) => part !== '')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
  .join(' ');

export const normalizeContact = (contact) => {
  const values = {
    имя: normalizeName(contact.имя),
    телефон: normalizePhone(contact.телефон),
    почта: normalizeEmail(contact.почта),
  };
  const rejectedValues = Object.values(values).filter((value) => value === null).length;
  const normalized = { ...contact };
  for (const [field, value] of Object.entries(values)) {
    normalized[field] = value ?? '';
  }
  return { contact: normalized, rejectedValues };
};
