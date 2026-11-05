#!/usr/bin/env node

import { Command } from 'commander';
import { runFiles } from '../src/files.js';
import { writeRegistry } from '../src/registry.js';
import path from 'node:path';
const program = new Command();

program
  .name('file-automation')
  .description('Автоматизация разбора файлов компании')
  .version('1.0.0', '-V, --version', 'вывести номер версии')
  .helpOption('-h, --help', 'показать справку');

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
    console.log(`Файлов найдено: ${summary.total}`);
    console.log(`Табличных документов: ${summary.tabular}, текстовых: ${summary.text}, непарсимых: ${summary.unparseable}`);
    console.log(`Документов: ${summary.documents}, требуют ручного разбора: ${summary.manual}, посторонних: ${summary.unrelated}`);
    console.log(`Дубликатов найдено: ${summary.duplicates} в ${summary.duplicateGroups.length} группах`);
    console.log(`Реестр: ${registryPath}`);
  });

program
  .command('contacts <папка>')
  .description('Собрать чистую таблицу контактов')
  .option('-o, --out <путь>', 'куда сохранить результат (по умолчанию: ./out)', './out')
  .action(() => {
    // логика команды contacts
  });

if (!process.argv.slice(2).length) {
  program.outputHelp(); // вывод справки
  process.exit(0);
}

program.parse();
