import { openDB, type IDBPDatabase } from "idb";
import { DB_NAME, DB_VERSION, type MilaDBSchema } from "./schema";

/**
 * IndexedDB Connection Manager
 *
 * Singleton pattern for database connection.
 * Handles initialization and migrations.
 */

let dbInstance: IDBPDatabase<MilaDBSchema> | null = null;
let dbPromise: Promise<IDBPDatabase<MilaDBSchema>> | null = null;

/**
 * Get or create the database connection
 */
export async function getDB(): Promise<IDBPDatabase<MilaDBSchema>> {
  // Return existing instance
  if (dbInstance) {
    return dbInstance;
  }

  // Return pending promise if initialization is in progress
  if (dbPromise) {
    return dbPromise;
  }

  // Create new connection
  dbPromise = openDB<MilaDBSchema>(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[MILA DB] Upgrading from v${oldVersion} to v${newVersion}`);

      // Version 1: Initial schema
      if (oldVersion < 1) {
        // Patients store
        const patientsStore = db.createObjectStore("patients", {
          keyPath: "id",
        });
        patientsStore.createIndex("by-createdAt", "createdAt");

        // Observations store
        const observationsStore = db.createObjectStore("observations", {
          keyPath: "id",
        });
        observationsStore.createIndex("by-patientId", "patientId");
        observationsStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        observationsStore.createIndex("by-patientId-category", [
          "patientId",
          "category",
        ]);
        observationsStore.createIndex("by-patientId-severity", [
          "patientId",
          "severity",
        ]);

        // Transfusions store
        const transfusionsStore = db.createObjectStore("transfusions", {
          keyPath: "id",
        });
        transfusionsStore.createIndex("by-patientId", "patientId");
        transfusionsStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        transfusionsStore.createIndex("by-patientId-type", [
          "patientId",
          "type",
        ]);

        // Lab Values store
        const labValuesStore = db.createObjectStore("labValues", {
          keyPath: "id",
        });
        labValuesStore.createIndex("by-patientId", "patientId");
        labValuesStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        labValuesStore.createIndex("by-patientId-labTypeId", [
          "patientId",
          "labTypeId",
        ]);
        labValuesStore.createIndex("by-patientId-labTypeId-occurredAt", [
          "patientId",
          "labTypeId",
          "occurredAt",
        ]);

        // Alerts store
        const alertsStore = db.createObjectStore("alerts", {
          keyPath: "id",
        });
        alertsStore.createIndex("by-patientId", "patientId");
        alertsStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        alertsStore.createIndex("by-patientId-acknowledged", [
          "patientId",
          "acknowledged",
        ]);

        // Metadata store
        db.createObjectStore("metadata", {
          keyPath: "key",
        });

        console.log("[MILA DB] Created all stores for v1");
      }

      // Version 2: Add phlebotomies, feedings, orders stores
      if (oldVersion < 2) {
        // Phlebotomies store
        const phlebotomiesStore = db.createObjectStore("phlebotomies", {
          keyPath: "id",
        });
        phlebotomiesStore.createIndex("by-patientId", "patientId");
        phlebotomiesStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);

        // Feedings store
        const feedingsStore = db.createObjectStore("feedings", {
          keyPath: "id",
        });
        feedingsStore.createIndex("by-patientId", "patientId");
        feedingsStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        feedingsStore.createIndex("by-patientId-tolerance", [
          "patientId",
          "tolerance",
        ]);

        // Orders store
        const ordersStore = db.createObjectStore("orders", {
          keyPath: "id",
        });
        ordersStore.createIndex("by-patientId", "patientId");
        ordersStore.createIndex("by-patientId-status", [
          "patientId",
          "status",
        ]);
        ordersStore.createIndex("by-patientId-orderType", [
          "patientId",
          "orderType",
        ]);
        ordersStore.createIndex("by-orderedAt", "orderedAt");

        console.log("[MILA DB] Created stores for v2: phlebotomies, feedings, orders");
      }

      // Version 3: Add clinicalStatuses, developmentalCareSessions stores
      if (oldVersion < 3) {
        // Clinical Statuses store
        const clinicalStatusesStore = db.createObjectStore("clinicalStatuses", {
          keyPath: "id",
        });
        clinicalStatusesStore.createIndex("by-patientId", "patientId");
        clinicalStatusesStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);

        // Developmental Care Sessions store
        const developmentalCareStore = db.createObjectStore("developmentalCareSessions", {
          keyPath: "id",
        });
        developmentalCareStore.createIndex("by-patientId", "patientId");
        developmentalCareStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        developmentalCareStore.createIndex("by-patientId-type", [
          "patientId",
          "type",
        ]);

        console.log("[MILA DB] Created stores for v3: clinicalStatuses, developmentalCareSessions");
      }

      // Version 4: Add treatmentPlans store
      if (oldVersion < 4) {
        const treatmentPlansStore = db.createObjectStore("treatmentPlans", {
          keyPath: "id",
        });
        treatmentPlansStore.createIndex("by-patientId", "patientId");
        treatmentPlansStore.createIndex("by-patientId-occurredAt", [
          "patientId",
          "occurredAt",
        ]);
        treatmentPlansStore.createIndex("by-patientId-status", [
          "patientId",
          "status",
        ]);
        treatmentPlansStore.createIndex("by-patientId-category", [
          "patientId",
          "category",
        ]);

        console.log("[MILA DB] Created stores for v4: treatmentPlans");
      }

      // Future migrations go here:
      // if (oldVersion < 5) { ... }
    },

    blocked() {
      console.warn("[MILA DB] Database upgrade blocked by another tab");
    },

    blocking() {
      console.warn("[MILA DB] This tab is blocking a database upgrade");
      // Close connection to allow upgrade in other tab
      dbInstance?.close();
      dbInstance = null;
    },

    terminated() {
      console.error("[MILA DB] Database connection terminated unexpectedly");
      dbInstance = null;
      dbPromise = null;
    },
  });

  try {
    dbInstance = await dbPromise;
    console.log("[MILA DB] Database connection established");
    return dbInstance;
  } catch (error) {
    console.error("[MILA DB] Failed to open database:", error);
    dbPromise = null;
    throw error;
  }
}

/**
 * Close the database connection
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    dbPromise = null;
    console.log("[MILA DB] Database connection closed");
  }
}

/**
 * Delete the entire database (for reset functionality)
 */
export async function deleteDatabase(): Promise<void> {
  closeDB();

  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(DB_NAME);

    request.onsuccess = () => {
      console.log("[MILA DB] Database deleted successfully");
      resolve();
    };

    request.onerror = () => {
      console.error("[MILA DB] Failed to delete database");
      reject(request.error);
    };

    request.onblocked = () => {
      console.warn("[MILA DB] Database deletion blocked");
      // Still resolve after a delay - the deletion will complete when tabs close
      setTimeout(resolve, 1000);
    };
  });
}

/**
 * Check if database exists and has data
 */
export async function isDatabaseInitialized(): Promise<boolean> {
  try {
    const db = await getDB();
    const count = await db.count("patients");
    return count > 0;
  } catch {
    return false;
  }
}

/**
 * Get metadata value
 */
export async function getMetadata<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const record = await db.get("metadata", key);
  return record ? (record.value as T) : null;
}

/**
 * Set metadata value
 */
export async function setMetadata<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put("metadata", {
    key,
    value,
    updatedAt: new Date().toISOString(),
  });
}
