import { parse } from 'csv-parse/sync';

export const parseTable = (content, extension) => {
  if (extension === '.csv') {
    const [columns = [], ...rows] = parse(content, {
      bom: true,
      delimiter: [',', ';'],
      skip_empty_lines: true,
      relax_column_count: true,
    });
    return { columns, rows };
  }

  if (extension === '.json') {
    const rows = JSON.parse(content);
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { columns, rows };
  }

  throw new Error(`Неподдерживаемое расширение таблицы: ${extension}`);
};
