import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

export const buildFilesReport = (summary, folder) => {
  const relative = (file) => path.relative(folder, file.path);
  const data = {
    total_files: summary.total,
    types: { tabular: summary.tabular, text: summary.text, unparseable: summary.unparseable },
    statuses: { documents: summary.documents, manual: summary.manual, unrelated: summary.unrelated },
    manual_review: summary.files.filter((file) => file.status === 'требует ручного разбора').map(relative),
    unrelated_files: summary.files.filter((file) => file.status === 'постороннее').map(relative),
    duplicate_count: summary.duplicates,
    duplicate_group_count: summary.duplicateGroups.length,
    duplicates: summary.duplicateGroups.map((group) => ({
      files: group.map(relative),
      excess_bytes: group.slice(1).reduce((total, file) => total + file.size, 0),
    })),
  };
  const lines = [
    `Файлов найдено: ${data.total_files}`,
    `Табличных документов: ${data.types.tabular}, текстовых: ${data.types.text}, непарсимых: ${data.types.unparseable}`,
    `Документов: ${data.statuses.documents}, требуют ручного разбора: ${data.statuses.manual}, посторонних: ${data.statuses.unrelated}`,
    '',
    `Требуют ручного разбора (${data.manual_review.length})`,
    'Программа не прочитала содержимое этих файлов; их нужно проверить человеку.',
    ...data.manual_review.map((name) => `  ${name}`),
    '',
    `Посторонние файлы (${data.unrelated_files.length}) — рекомендуются к удалению`,
    ...data.unrelated_files.map((name) => `  ${name}`),
    '',
    `Дубликатов найдено: ${data.duplicate_count} в ${data.duplicate_group_count} группах`,
  ];
  data.duplicates.forEach((group, index) => {
    lines.push('', `Группа ${index + 1}. Лишний размер: ${group.excess_bytes} байт`,
      ...group.files.map((name) => `  ${name}`));
  });
  return { data, text: lines.join('\n') };
};

export const buildContactsReport = (summary) => {
  const data = {
    source_count: summary.sources.length,
    records_before_merge: summary.total,
    unique_contacts: summary.contacts.length,
    rejected_values: summary.rejectedValues,
    discarded_records: summary.discardedRecords,
    sources: summary.sources,
  };
  const lines = [
    `Выгрузок прочитано: ${data.source_count}, записей: ${data.records_before_merge}`,
    `Уникальных контактов: ${data.unique_contacts}`,
    `Из ${data.source_count} выгрузок прочитано ${data.records_before_merge} записей, после склейки осталось ${data.unique_contacts} контактов`,
    `Отбраковано значений: ${data.rejected_values}, записей без телефона и почты: ${data.discarded_records}`,
    '',
    'Выгрузки:',
    ...data.sources.map((source) => `  ${source.name}: записей ${source.count}`),
  ];
  return { data, text: lines.join('\n') };
};

export const writeReports = (report, outputFolder) => {
  mkdirSync(outputFolder, { recursive: true });
  const textPath = path.join(outputFolder, 'report.txt');
  const jsonPath = path.join(outputFolder, 'report.json');
  writeFileSync(textPath, `${report.text}\n`, 'utf8');
  writeFileSync(jsonPath, `${JSON.stringify(report.data, null, 2)}\n`, 'utf8');
  return { textPath, jsonPath };
};
