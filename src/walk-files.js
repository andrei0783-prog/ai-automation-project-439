import { readdirSync } from 'node:fs';
import path from 'node:path';

export const walkFiles = (folder) => readdirSync(folder, {
  withFileTypes: true,
  recursive: true,
})
  .filter((entry) => entry.isFile())
  .map((entry) => path.join(entry.parentPath, entry.name))
  .sort();
