import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { stringify } from 'csv-stringify/sync';
import { parseTable } from './tables.js';

const columns = ['путь', 'имя', 'тип', 'размер', 'хеш', 'статус', 'основная копия', 'строк', 'колонки'];

export const writeRegistry = (files, outputFolder) => {
  const rows = files.map((file) => {
    let rowCount = '';
    let columnNames = '';
    if (file.type === 'табличный документ' && file.status === 'документ') {
      const table = parseTable(readFileSync(file.path, 'utf8'), file.extension);
      rowCount = table.rows.length;
      columnNames = table.columns.join('; ');
    }
    return [
      file.path, file.name, file.type, file.size, file.hash, file.status,
      file.duplicateOf ?? '', rowCount, columnNames,
    ];
  });

  const csv = stringify(rows, { header: true, columns });
  mkdirSync(outputFolder, { recursive: true });
  const registryPath = path.join(outputFolder, 'registry.csv');
  writeFileSync(registryPath, csv, 'utf8');
  return registryPath;
};
