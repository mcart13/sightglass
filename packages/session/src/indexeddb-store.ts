import type { SessionRecord } from "./session-schema.js";

const DEFAULT_DATABASE_NAME = "sightglass-sessions";
const STORE_NAME = "sessions";

export interface SessionStore {
  save(record: Readonly<SessionRecord>): Promise<Readonly<SessionRecord>>;
  load(id: string): Promise<Readonly<SessionRecord> | null>;
  list(): Promise<readonly SessionRecord[]>;
  remove(id: string): Promise<void>;
  exportSession(id: string): Promise<string>;
  importSession(payload: string): Promise<Readonly<SessionRecord>>;
}

export interface SessionStoreAdapter {
  put(record: Readonly<SessionRecord>): Promise<void>;
  get(id: string): Promise<Readonly<SessionRecord> | null>;
  list(): Promise<readonly SessionRecord[]>;
  delete(id: string): Promise<void>;
}

interface CreateIndexedDbSessionStoreOptions {
  readonly adapter?: SessionStoreAdapter;
  readonly databaseName?: string;
  readonly indexedDb?: IDBFactory;
}

const cloneRecord = (record: Readonly<SessionRecord>): Readonly<SessionRecord> =>
  structuredClone(record);

export const createMemorySessionAdapter = (
  initialRecords: readonly SessionRecord[] = [],
): SessionStoreAdapter => {
  const records = new Map(
    initialRecords.map((record) => [record.id, cloneRecord(record)]),
  );

  return {
    async put(record) {
      records.set(record.id, cloneRecord(record));
    },
    async get(id) {
      const record = records.get(id);
      return record ? cloneRecord(record) : null;
    },
    async list() {
      return Object.freeze(
        [...records.values()]
          .map((record) => cloneRecord(record))
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      );
    },
    async delete(id) {
      records.delete(id);
    },
  };
};

const promisifyRequest = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise((resolve, reject) => {
    request.addEventListener("success", () => resolve(request.result));
    request.addEventListener("error", () => reject(request.error));
  });

const openIndexedDb = async (
  indexedDb: IDBFactory,
  databaseName: string,
): Promise<IDBDatabase> => {
  const request = indexedDb.open(databaseName, 1);

  request.addEventListener("upgradeneeded", () => {
    const database = request.result;

    if (!database.objectStoreNames.contains(STORE_NAME)) {
      database.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
  });

  return promisifyRequest(request);
};

const createIndexedDbAdapter = async (
  indexedDb: IDBFactory,
  databaseName: string,
): Promise<SessionStoreAdapter> => {
  const database = await openIndexedDb(indexedDb, databaseName);

  const transact = async <T>(
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T>,
  ): Promise<T> => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = operation(transaction.objectStore(STORE_NAME));

    return promisifyRequest(request);
  };

  return {
    async put(record) {
      await transact("readwrite", (store) => store.put(cloneRecord(record)));
    },
    async get(id) {
      const record = await transact("readonly", (store) => store.get(id));
      return record ? cloneRecord(record as SessionRecord) : null;
    },
    async list() {
      const records = (await transact("readonly", (store) => store.getAll())) as SessionRecord[];
      return Object.freeze(
        records
          .map((record) => cloneRecord(record))
          .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
      );
    },
    async delete(id) {
      await transact("readwrite", (store) => store.delete(id));
    },
  };
};

const parseSessionPayload = (payload: string): SessionRecord => {
  const parsed = JSON.parse(payload) as SessionRecord;

  if (!parsed || typeof parsed !== "object" || typeof parsed.id !== "string") {
    throw new Error("Invalid Sightglass session payload.");
  }

  return parsed;
};

export const createIndexedDbSessionStore = async (
  options: CreateIndexedDbSessionStoreOptions = {},
): Promise<SessionStore> => {
  const adapter =
    options.adapter ??
    (options.indexedDb
      ? await createIndexedDbAdapter(
          options.indexedDb,
          options.databaseName ?? DEFAULT_DATABASE_NAME,
        )
      : typeof indexedDB !== "undefined"
        ? await createIndexedDbAdapter(
            indexedDB,
            options.databaseName ?? DEFAULT_DATABASE_NAME,
          )
        : createMemorySessionAdapter());

  return {
    async save(record) {
      const saved = cloneRecord(record);
      await adapter.put(saved);
      return saved;
    },
    async load(id) {
      return adapter.get(id);
    },
    async list() {
      return adapter.list();
    },
    async remove(id) {
      await adapter.delete(id);
    },
    async exportSession(id) {
      const record = await adapter.get(id);

      if (!record) {
        throw new Error(`Session ${id} was not found.`);
      }

      return JSON.stringify(record, null, 2);
    },
    async importSession(payload) {
      const record = cloneRecord(parseSessionPayload(payload));
      await adapter.put(record);
      return record;
    },
  };
};
