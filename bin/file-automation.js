#!/usr/bin/env node

import { Command } from 'commander';
import { runFiles } from '../src/files.js';
import { writeRegistry } from '../src/registry.js';
import { runContacts, writeContacts } from '../src/contacts.js';
import path from 'node:path';
import { buildFilesReport, buildContactsReport, writeReports } from '../src/reports.js';
const program = new Command();

program
  .name('file-automation')
  .description('Автоматизация разбора файлов компании')
  .version('1.0.0', '-V, --version', 'вывести номер версии')
  .helpOption('-h, --help', 'показать справку')
  .showHelpAfterError();

program
  .command('files <папка>')
  .description('Собрать реестр документов папки')
  .option('-o, --out <путь>', 'куда сохранить результат (по умолчанию: ./out)', './out')
  .action((folder, options) => {
    if (path.resolve(folder) === path.resolve(options.out)) {
      throw new Error('Папка результата должна отличаться от исходной папки.');
    }
    const summary = runFiles(folder);
    const registryPath = writeRegistry(summary.files, options.out);
    const reports = writeReports(buildFilesReport(summary, folder), options.out);
    console.log(`Файлов найдено: ${summary.total}`);
    console.log(`Табличных документов: ${summary.tabular}, текстовых: ${summary.text}, непарсимых: ${summary.unparseable}`);
    console.log(`Документов: ${summary.documents}, требуют ручного разбора: ${summary.manual}, посторонних: ${summary.unrelated}`);
    console.log(`Дубликатов найдено: ${summary.duplicates} в ${summary.duplicateGroups.length} группах`);
    console.log(`Реестр: ${registryPath}`);
    console.log(`Отчёт: ${reports.textPath}`);
    console.log(`Отчёт для программ: ${reports.jsonPath}`);
  });

program
  .command('contacts <папка>')
  .description('Собрать чистую таблицу контактов')
  .option('-o, --out <путь>', 'куда сохранить результат (по умолчанию: ./out)', './out')
  .action((folder, options) => {
    if (path.resolve(folder) === path.resolve(options.out)) {
      throw new Error('Папка результата должна отличаться от исходной папки.');
    }
    const summary = runContacts(folder);
    const contactsPath = writeContacts(summary.contacts, options.out);
    const reports = writeReports(buildContactsReport(summary), options.out);
    for (const source of summary.sources) {
      console.log(`${source.name}: записей ${source.count}`);
    }
    console.log(`Выгрузок прочитано: ${summary.sources.length}, записей: ${summary.total}`);
    console.log(`Уникальных контактов: ${summary.contacts.length}`);
    console.log(`Отбраковано значений: ${summary.rejectedValues}, записей без телефона и почты: ${summary.discardedRecords}`);
    const unmatched = summary.unmatchedColumns
      .map(({ column, source }) => `${column} (${source})`);
    console.log(`Колонки без соответствия: ${unmatched.join(', ') || 'нет'}`);
    console.log(`Таблица: ${contactsPath}`);
    console.log(`Отчёт: ${reports.textPath}`);
    console.log(`Отчёт для программ: ${reports.jsonPath}`);
  });

if (!process.argv.slice(2).length) {
  program.outputHelp(); // вывод справки
  process.exit(0);
}

program.parse();
