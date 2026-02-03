import { getDB } from "../connection";
import type { MilaDBSchema } from "../schema";
import type { BaseEntity } from "../../types/domain";
import { generateId } from "../../utils/ids";
import { nowISO } from "../../utils/dates";

// Valid store names for entity repositories (excluding metadata)
type EntityStoreName = "patients" | "observations" | "transfusions" | "labValues" | "alerts" | "phlebotomies" | "feedings" | "orders" | "clinicalStatuses" | "developmentalCareSessions";

/**
 * Base Repository
 *
 * Provides common CRUD operations for all entity types.
 * Specific repositories extend this with indexed queries.
 */
export abstract class BaseRepository<
  TStore extends EntityStoreName,
  TEntity extends BaseEntity,
  TCreate extends Omit<TEntity, "id" | "createdAt" | "updatedAt">,
  TUpdate extends Partial<TCreate>
> {
  protected readonly storeName: TStore;

  constructor(storeName: TStore) {
    this.storeName = storeName;
  }

  /**
   * Get entity by primary key
   */
  async getById(id: string): Promise<TEntity | null> {
    const db = await getDB();
    // Type assertion needed because idb's strict typing doesn't infer generic store names
    const record = await (db.get as (store: TStore, key: string) => Promise<TEntity | undefined>)(
      this.storeName,
      id
    );
    return record ?? null;
  }

  /**
   * Create a new entity
   */
  async create(data: TCreate): Promise<TEntity> {
    const db = await getDB();
    const now = nowISO();

    const entity = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as unknown as TEntity;

    await (db.add as (store: TStore, value: TEntity) => Promise<string>)(
      this.storeName,
      entity
    );
    return entity;
  }

  /**
   * Update an existing entity
   */
  async update(id: string, data: TUpdate): Promise<TEntity | null> {
    const db = await getDB();
    const existing = await this.getById(id);

    if (!existing) {
      return null;
    }

    const updated = {
      ...existing,
      ...data,
      id, // Ensure ID is not changed
      createdAt: existing.createdAt, // Preserve creation time
      updatedAt: nowISO(),
    } as unknown as TEntity;

    await (db.put as (store: TStore, value: TEntity) => Promise<string>)(
      this.storeName,
      updated
    );
    return updated;
  }

  /**
   * Delete an entity
   */
  async delete(id: string): Promise<boolean> {
    const db = await getDB();
    const existing = await this.getById(id);

    if (!existing) {
      return false;
    }

    await (db.delete as (store: TStore, key: string) => Promise<void>)(
      this.storeName,
      id
    );
    return true;
  }

  /**
   * Count all records in store
   */
  async count(): Promise<number> {
    const db = await getDB();
    return (db.count as (store: TStore) => Promise<number>)(this.storeName);
  }

  /**
   * Clear all records in store
   */
  async clear(): Promise<void> {
    const db = await getDB();
    await (db.clear as (store: TStore) => Promise<void>)(this.storeName);
  }

  /**
   * Get all records (use with caution on large datasets)
   */
  async getAll(): Promise<TEntity[]> {
    const db = await getDB();
    const records = await (db.getAll as (store: TStore) => Promise<TEntity[]>)(
      this.storeName
    );
    return records;
  }

  /**
   * Bulk create entities
   */
  async bulkCreate(items: TCreate[]): Promise<TEntity[]> {
    const db = await getDB();
    const now = nowISO();

    const entities = items.map((data) => ({
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    })) as unknown as TEntity[];

    // Use type assertion for transaction since idb types don't infer generic store names
    const tx = (db.transaction as unknown as (store: TStore, mode: "readwrite") => {
      objectStore: (name: TStore) => { add: (value: TEntity) => Promise<string> };
      done: Promise<void>;
    })(this.storeName, "readwrite");

    const store = tx.objectStore(this.storeName);

    for (const entity of entities) {
      await store.add(entity);
    }

    await tx.done;
    return entities;
  }
}
