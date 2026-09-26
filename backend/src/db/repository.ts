import { supabase, isLiveSupabaseConfigured } from '../config/supabase.config.js';
import { Logger } from '../core/logger/logger.js';
import { localStore, type LocalCollectionName, type LocalDbStore } from './local-store.js';

export interface UserScopedRecord {
    id: string;
    user_id: string;
}

export interface OrderBy<T> {
    column: keyof T & string;
    ascending?: boolean;
}

const TABLE_MISSING_FRAGMENTS = ['schema cache', 'does not exist', 'relation'];

function isTableMissing(error: { message?: string } | null): boolean {
    if (!error) {
        return false;
    }
    const message = (error.message ?? '').toLowerCase();
    return TABLE_MISSING_FRAGMENTS.some((fragment) => message.includes(fragment));
}

export class Repository<T extends UserScopedRecord> {
    private readonly logger: Logger;

    constructor(
        private readonly table: string,
        private readonly collection: LocalCollectionName,
    ) {
        this.logger = new Logger(`Repository:${table}`);
    }

    public async findAllByUser(userId: string, orderBy?: OrderBy<T>): Promise<T[]> {
        if (isLiveSupabaseConfigured) {
            let query = supabase.from(this.table).select('*').eq('user_id', userId);
            if (orderBy) {
                query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
            }
            const { data, error } = await query;
            if (!error) {
                return (data ?? []) as T[];
            }
            this.throwUnlessTableMissing(error, 'findAllByUser');
        }

        const rows = this.localRows().filter((row) => row.user_id === userId);
        return orderBy ? this.sortRows(rows, orderBy) : rows;
    }

    public async findByIdForUser(id: string, userId: string): Promise<T | null> {
        if (isLiveSupabaseConfigured) {
            const { data, error } = await supabase
                .from(this.table)
                .select('*')
                .eq('id', id)
                .eq('user_id', userId)
                .maybeSingle();
            if (!error) {
                return (data as T) ?? null;
            }
            this.throwUnlessTableMissing(error, 'findByIdForUser');
        }

        return this.localRows().find((row) => row.id === id && row.user_id === userId) ?? null;
    }

    public async findOneByUserWhere(userId: string, filters: Partial<T>): Promise<T | null> {
        const entries = Object.entries(filters) as [string, unknown][];

        if (isLiveSupabaseConfigured) {
            let query = supabase.from(this.table).select('*').eq('user_id', userId);
            for (const [column, value] of entries) {
                query = query.eq(column, value);
            }
            const { data, error } = await query.maybeSingle();
            if (!error) {
                return (data as T) ?? null;
            }
            this.throwUnlessTableMissing(error, 'findOneByUserWhere');
        }

        return (
            this.localRows().find(
                (row) =>
                    row.user_id === userId &&
                    entries.every(([column, value]) => (row as Record<string, unknown>)[column] === value),
            ) ?? null
        );
    }

    public async insert(record: T): Promise<T> {
        const [created] = await this.insertMany([record]);
        return created;
    }

    public async insertMany(records: T[]): Promise<T[]> {
        if (records.length === 0) {
            return [];
        }

        if (isLiveSupabaseConfigured) {
            const { data, error } = await supabase.from(this.table).insert(records).select();
            if (!error) {
                return (data ?? []) as T[];
            }
            this.throwUnlessTableMissing(error, 'insertMany');
        }

        return localStore.update((store) => {
            const rows = store[this.collection] as unknown as T[];
            rows.push(...records);
            return records;
        });
    }

    public async updateForUser(id: string, userId: string, patch: Partial<T>): Promise<T | null> {
        if (isLiveSupabaseConfigured) {
            const { data, error } = await supabase
                .from(this.table)
                .update(patch as never)
                .eq('id', id)
                .eq('user_id', userId)
                .select()
                .maybeSingle();
            if (!error) {
                return (data as T) ?? null;
            }
            this.throwUnlessTableMissing(error, 'updateForUser');
        }

        return localStore.update((store) => {
            const rows = store[this.collection] as unknown as T[];
            const index = rows.findIndex((row) => row.id === id && row.user_id === userId);
            if (index === -1) {
                return null;
            }
            rows[index] = { ...rows[index], ...patch };
            return rows[index];
        });
    }

    public async deleteForUser(id: string, userId: string): Promise<boolean> {
        if (isLiveSupabaseConfigured) {
            const { error } = await supabase.from(this.table).delete().eq('id', id).eq('user_id', userId);
            if (!error) {
                return true;
            }
            this.throwUnlessTableMissing(error, 'deleteForUser');
        }

        return localStore.update((store) => {
            const rows = store[this.collection] as unknown as T[];
            const index = rows.findIndex((row) => row.id === id && row.user_id === userId);
            if (index === -1) {
                return false;
            }
            rows.splice(index, 1);
            return true;
        });
    }

    public async deleteAllByUser(userId: string): Promise<void> {
        if (isLiveSupabaseConfigured) {
            const { error } = await supabase.from(this.table).delete().eq('user_id', userId);
            if (!error) {
                return;
            }
            this.throwUnlessTableMissing(error, 'deleteAllByUser');
        }

        localStore.update((store) => {
            const rows = (store[this.collection] ?? []) as unknown as T[];
            const remaining = rows.filter((row) => row.user_id !== userId);
            (store as unknown as Record<LocalCollectionName, unknown[]>)[this.collection] = remaining;
        });
    }

    private localRows(): T[] {
        const store: LocalDbStore = localStore.read();
        return (store[this.collection] ?? []) as unknown as T[];
    }

    private sortRows(rows: T[], orderBy: OrderBy<T>): T[] {
        const direction = orderBy.ascending === false ? -1 : 1;
        return [...rows].sort((a, b) => {
            const left = a[orderBy.column] as unknown as string | number;
            const right = b[orderBy.column] as unknown as string | number;
            if (left === right) {
                return 0;
            }
            return (left < right ? -1 : 1) * direction;
        });
    }

    private throwUnlessTableMissing(error: { message?: string }, operation: string): void {
        if (isTableMissing(error)) {
            this.logger.warn(`Table "${this.table}" is not migrated; falling back to the local store`);
            return;
        }
        this.logger.error(`${operation} failed on "${this.table}"`, error);
        throw new Error(error.message ?? `Database operation ${operation} failed`);
    }
}
