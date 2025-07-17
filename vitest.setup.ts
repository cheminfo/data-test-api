import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

mkdirSync(join(import.meta.dirname, 'data/e.txt'), { recursive: true });
