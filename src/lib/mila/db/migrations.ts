/**
 * Database Migration Framework
 *
 * While IndexedDB handles schema migrations via version upgrades,
 * this module provides utilities for data migrations that may be
 * needed when domain types change.
 */

import { getDB, setMetadata, getMetadata } from "./connection";

export interface MigrationRecord {
  version: number;
  appliedAt: string;
  description: string;
}

const MIGRATIONS_KEY = "applied-migrations";

/**
 * Get list of applied migrations
 */
export async function getAppliedMigrations(): Promise<MigrationRecord[]> {
  const migrations = await getMetadata<MigrationRecord[]>(MIGRATIONS_KEY);
  return migrations || [];
}

/**
 * Record that a migration was applied
 */
async function recordMigration(
  version: number,
  description: string
): Promise<void> {
  const migrations = await getAppliedMigrations();
  migrations.push({
    version,
    appliedAt: new Date().toISOString(),
    description,
  });
  await setMetadata(MIGRATIONS_KEY, migrations);
}

/**
 * Check if a specific migration has been applied
 */
export async function isMigrationApplied(version: number): Promise<boolean> {
  const migrations = await getAppliedMigrations();
  return migrations.some((m) => m.version === version);
}

/**
 * Data Migration Definitions
 *
 * Add new migrations here as needed. Each migration should:
 * 1. Check if it needs to run
 * 2. Perform the data transformation
 * 3. Handle errors gracefully
 */

interface DataMigration {
  version: number;
  description: string;
  migrate: () => Promise<void>;
}

const DATA_MIGRATIONS: DataMigration[] = [
  // Example migration (not needed for v1, but shows the pattern):
  // {
  //   version: 1,
  //   description: "Normalize observation sources to lowercase",
  //   async migrate() {
  //     const db = await getDB();
  //     const tx = db.transaction("observations", "readwrite");
  //     const store = tx.objectStore("observations");
  //
  //     let cursor = await store.openCursor();
  //     while (cursor) {
  //       const observation = cursor.value;
  //       if (observation.source !== observation.source.toLowerCase()) {
  //         observation.source = observation.source.toLowerCase();
  //         await cursor.update(observation);
  //       }
  //       cursor = await cursor.continue();
  //     }
  //
  //     await tx.done;
  //   },
  // },
];

/**
 * Run all pending data migrations
 */
export async function runPendingMigrations(): Promise<void> {
  // Ensure DB is open
  await getDB();

  for (const migration of DATA_MIGRATIONS) {
    const applied = await isMigrationApplied(migration.version);

    if (!applied) {
      console.log(
        `[MILA Migration] Running migration v${migration.version}: ${migration.description}`
      );

      try {
        await migration.migrate();
        await recordMigration(migration.version, migration.description);
        console.log(
          `[MILA Migration] Completed migration v${migration.version}`
        );
      } catch (error) {
        console.error(
          `[MILA Migration] Failed migration v${migration.version}:`,
          error
        );
        throw error;
      }
    }
  }
}

/**
 * Get migration status for debugging
 */
export async function getMigrationStatus(): Promise<{
  applied: MigrationRecord[];
  pending: DataMigration[];
  current: number;
}> {
  const applied = await getAppliedMigrations();
  const appliedVersions = new Set(applied.map((m) => m.version));
  const pending = DATA_MIGRATIONS.filter(
    (m) => !appliedVersions.has(m.version)
  );
  const current = applied.length > 0 ? Math.max(...applied.map((m) => m.version)) : 0;

  return { applied, pending, current };
}
