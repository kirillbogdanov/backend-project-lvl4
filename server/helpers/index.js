/* eslint-disable no-underscore-dangle */
import { fileURLToPath } from 'url';
import path from 'path';

export const __filename = fileURLToPath(import.meta.url);
export const __dirname = path.dirname(__filename);

export function getDirname()
{
  return path.dirname(fileURLToPath(import.meta.url));
};
