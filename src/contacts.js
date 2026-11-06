import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { stringify } from 'csv-stringify/sync';
import path from 'node:path';
import { parseTable } from './tables.js';
import { normalizeContact } from './normalize-contact.js';
import { walkFiles } from './walk-files.js';

export const columnMap = {
  имя: ['имя', 'фио', 'name'],
  телефон: ['телефон', 'моб. телефон', 'phone'],
  почта: ['почта', 'e-mail', 'email'],
};

const normalizeColumn = (column) => column.trim().toLowerCase();
const getField = (column) => Object.keys(columnMap)
  .find((field) => columnMap[field].includes(normalizeColumn(column)));

export const mergeContacts = (contacts) => {
  const byKey = new Map();
  let discardedRecords = 0;
  for (const contact of contacts) {
    const key = contact.телефон
      ? `phone:${contact.телефон}`
      : contact.почта ? `email:${contact.почта}` : '';
    if (!key) {
      discardedRecords += 1;
      continue;
    }
    const existing = byKey.get(key);
    if (existing) {
      for (const field of Object.keys(columnMap)) {
        existing[field] = existing[field] || contact[field];
      }
      if (!existing.источники.includes(contact.источник)) {
        existing.источники.push(contact.источник);
      }
    } else {
      byKey.set(key, {
        имя: contact.имя,
        телефон: contact.телефон,
        почта: contact.почта,
        источники: [contact.источник],
      });
    }
  }
  return { contacts: [...byKey.values()], discardedRecords };
};

export const writeContacts = (contacts, outputFolder) => {
  const rows = contacts.map((contact) => ({
    ...contact,
    источники: contact.источники.join('; '),
  }));
  const csv = stringify(rows, {
    header: true,
    columns: ['имя', 'телефон', 'почта', 'источники'],
    bom: true,
  });
  mkdirSync(outputFolder, { recursive: true });
  const contactsPath = path.join(outputFolder, 'contacts.csv');
  writeFileSync(contactsPath, csv, 'utf8');
  return contactsPath;
};

export const runContacts = (folder) => {
  const contacts = [];
  const sources = [];
  const unmatchedColumns = [];
  let rejectedValues = 0;
  for (const filePath of walkFiles(folder)) {
    const name = path.basename(filePath);
    const extension = path.extname(name).toLowerCase();
    if (!['.csv', '.json'].includes(extension)) continue;
    if (statSync(filePath).size === 0) continue;
    const content = readFileSync(filePath, 'utf8');
    if (content.trim() === '') continue;
    const table = parseTable(content, extension);
    // В JSON поля могут появиться и в последующих объектах.
    const columns = extension === '.json'
      ? [...new Set(table.rows.flatMap((row) => Object.keys(row)))]
      : table.columns;
    const isContacts = columns.some((column) => {
      const field = getField(column);
      return field === 'телефон' || field === 'почта';
    });
    if (!isContacts) continue;

    for (const column of new Set(columns)) {
      if (!getField(column)) unmatchedColumns.push({ column, source: name });
    }

    for (const row of table.rows) {
      const contact = Object.fromEntries(Object.keys(columnMap).map((field) => [field, '']));
      contact.источник = name;
      const entries = extension === '.csv'
        ? table.columns.map((column, index) => [column, row[index]])
        : Object.entries(row);
      for (const [column, value] of entries) {
        const field = getField(column);
        if (field) contact[field] = value ?? '';
      }
      const result = normalizeContact(contact);
      rejectedValues += result.rejectedValues;
      contacts.push(result.contact);
    }
    sources.push({ name, count: table.rows.length });
  }

  const merged = mergeContacts(contacts);
  return {
    contacts: merged.contacts,
    discardedRecords: merged.discardedRecords,
    sources,
    unmatchedColumns,
    total: contacts.length,
    rejectedValues,
  };
};
