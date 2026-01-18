import fs from 'fs/promises';
import path from 'path';

export type RatesEntry = {
  id: string;
  base: string;
  rates: Record<string, number>;
  source?: string;
  fetchedAt: string; // ISO timestamp
};

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'rates.json');

async function ensureDataFile() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(DATA_FILE);
  } catch (err) {
    await fs.writeFile(DATA_FILE, '[]', 'utf-8');
  }
}

export async function readRates(): Promise<RatesEntry[]> {
  await ensureDataFile();
  const raw = await fs.readFile(DATA_FILE, 'utf-8');
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as RatesEntry[];
  } catch (err) {
    return [];
  }
}

export async function writeRates(entries: RatesEntry[]) {
  await ensureDataFile();
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function addRates(
  entry: Omit<RatesEntry, 'id' | 'fetchedAt'> & { fetchedAt?: string }
) {
  const entries = await readRates();
  const now = new Date().toISOString();
  const newEntry: RatesEntry = {
    id: String(Date.now()),
    base: entry.base,
    rates: entry.rates,
    source: entry.source,
    fetchedAt: entry.fetchedAt ?? now,
  };
  entries.push(newEntry);
  await writeRates(entries);
  return newEntry;
}

export async function latestRate(): Promise<RatesEntry | null> {
  const entries = await readRates();
  if (entries.length === 0) return null;
  return entries[entries.length - 1];
}

export default {
  readRates,
  writeRates,
  addRates,
  latestRate,
};
