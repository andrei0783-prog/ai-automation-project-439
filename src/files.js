import { readdirSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import path from 'node:path';

const tableExtensions = ['.csv', '.json'];
const textExtensions = ['.txt', '.md', ''];
const allowedExtensions = ['.csv', '.json', '.txt', '.md', '.pdf', '.jpg', '.jpeg', '.xlsx'];
const junkNames = ['.DS_Store', 'Thumbs.db', 'desktop.ini'];

export const normalizeFileName = (fileName) => {
  const name = path.basename(fileName).toLowerCase();
  const extension = path.extname(name);
  const stem = path.basename(name, extension);
  return stem.replace(/^копия /u, '').replace(/ \(\d+\)$/u, '') + extension;
};

export const findDuplicates = (files) => {
  const byHash = Object.create(null);
  const byName = Object.create(null);
  const filesByPath = Object.fromEntries(files.map((file) => [file.path, file]));
  const sortedPaths = files.map((file) => file.path).sort();
  const groupsByPath = Object.create(null);
  let duplicates = 0;

  const sortedFiles = sortedPaths.map((filePath) => {
    const file = filesByPath[filePath];
    const normalizedName = normalizeFileName(file.name);
    // При совпадениях с разными основными копиями приоритет у содержимого.
    const primary = byHash[file.hash] ?? byName[normalizedName];
    const result = { ...file, normalizedName, duplicateOf: primary?.path ?? null };

    if (primary) {
      duplicates += 1;
      groupsByPath[primary.path] ??= [primary];
      groupsByPath[primary.path].push(result);
    } else {
      byHash[file.hash] = result;
      byName[normalizedName] = result;
    }
    return result;
  });

  return { files: sortedFiles, duplicates, duplicateGroups: Object.values(groupsByPath) };
};

export const getFileType = (extension) => {
  if (tableExtensions.includes(extension)) return 'табличный документ';
  if (textExtensions.includes(extension)) return 'текстовый документ';
  return 'непарсимый';
};

export const getFileStatus = (file) => {
  if (junkNames.includes(file.name)) return 'постороннее';
  if (file.size === 0) return 'постороннее';
  if (file.extension !== '' && !allowedExtensions.includes(file.extension)) return 'постороннее';
  if (file.type === 'непарсимый') return 'требует ручного разбора';
  return 'документ';
};

export const collectFiles = (folder) => {
  const entries = readdirSync(folder, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const filePath = path.join(folder, entry.name);
      const file = {
        path: filePath,
        name: entry.name,
        extension: path.extname(entry.name),
        size: statSync(filePath).size,
        hash: createHash('sha256').update(readFileSync(filePath)).digest('hex'),
      };
      file.type = getFileType(file.extension);
      file.status = getFileStatus(file);
      return file;
    });
};

export const runFiles = (folder) => {
  const { files, duplicates, duplicateGroups } = findDuplicates(collectFiles(folder));
  return {
    files,
    duplicates,
    duplicateGroups,
    total: files.length,
    tabular: files.filter((file) => file.type === 'табличный документ').length,
    text: files.filter((file) => file.type === 'текстовый документ').length,
    unparseable: files.filter((file) => file.type === 'непарсимый').length,
    documents: files.filter((file) => file.status === 'документ').length,
    manual: files.filter((file) => file.status === 'требует ручного разбора').length,
    unrelated: files.filter((file) => file.status === 'постороннее').length,
  };
};
