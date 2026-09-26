import fs from 'fs';
import path from 'path';
import type { Contact, ContactLink, Job, Task } from '../models/index.js';
import { Logger } from '../core/logger/logger.js';

export interface LocalDbStore {
    jobs: Job[];
    tasks: Task[];
    contacts: Contact[];
    contactLinks: ContactLink[];
}

export type LocalCollectionName = keyof LocalDbStore;

const DB_FILE_PATH = path.resolve(process.cwd(), 'local_db.json');
const EMPTY_STORE: LocalDbStore = { jobs: [], tasks: [], contacts: [], contactLinks: [] };

const logger = new Logger('LocalStore');

function read(): LocalDbStore {
    try {
        if (fs.existsSync(DB_FILE_PATH)) {
            const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
            return { ...EMPTY_STORE, ...JSON.parse(raw) };
        }
    } catch (error) {
        logger.error('Failed to read local database, falling back to an empty store', error);
    }
    return { ...EMPTY_STORE };
}

function write(store: LocalDbStore): void {
    try {
        fs.writeFileSync(DB_FILE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
        logger.error('Failed to write local database', error);
        throw error;
    }
}

function update<T>(mutate: (store: LocalDbStore) => T): T {
    const store = read();
    const result = mutate(store);
    write(store);
    return result;
}

export const localStore = { read, write, update };
