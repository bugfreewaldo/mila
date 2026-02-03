/**
 * Treatment Plan Repository
 *
 * Manages MILA-generated treatment plans that have been approved by physicians.
 */

import { getDB } from "../connection";
import { generateId, now } from "../../utils/ids";
import type {
  TreatmentPlan,
  CreateTreatmentPlan,
  UpdateTreatmentPlan,
  TreatmentPlanStatus,
  TreatmentPlanCategory,
  TreatmentPlanAction,
  PlanAmendment,
  AmendmentType,
} from "../../types/domain";

const STORE_NAME = "treatmentPlans";

export const TreatmentPlanRepository = {
  /**
   * Get treatment plan by ID
   */
  async getById(id: string): Promise<TreatmentPlan | null> {
    const db = await getDB();
    const result = await db.get(STORE_NAME, id);
    return result || null;
  },

  /**
   * Get all treatment plans for a patient
   */
  async byPatient(patientId: string): Promise<TreatmentPlan[]> {
    const db = await getDB();
    const index = db.transaction(STORE_NAME).store.index("by-patientId");
    const results = await index.getAll(patientId);
    // Sort by occurredAt descending (most recent first)
    return results.sort(
      (a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()
    );
  },

  /**
   * Get active treatment plans for a patient
   */
  async getActivePlans(patientId: string): Promise<TreatmentPlan[]> {
    const all = await this.byPatient(patientId);
    return all.filter((p) => p.status === "active");
  },

  /**
   * Get treatment plans by category
   */
  async byPatientAndCategory(
    patientId: string,
    category: TreatmentPlanCategory
  ): Promise<TreatmentPlan[]> {
    const all = await this.byPatient(patientId);
    return all.filter((p) => p.category === category);
  },

  /**
   * Get treatment plans by status
   */
  async byPatientAndStatus(
    patientId: string,
    status: TreatmentPlanStatus
  ): Promise<TreatmentPlan[]> {
    const all = await this.byPatient(patientId);
    return all.filter((p) => p.status === status);
  },

  /**
   * Create a new treatment plan
   */
  async create(data: CreateTreatmentPlan): Promise<TreatmentPlan> {
    const db = await getDB();
    const timestamp = now();
    const plan: TreatmentPlan = {
      ...data,
      id: generateId(),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    await db.add(STORE_NAME, plan);
    return plan;
  },

  /**
   * Update an existing treatment plan
   */
  async update(id: string, data: UpdateTreatmentPlan): Promise<TreatmentPlan | null> {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, id);
    if (!existing) return null;

    const updated: TreatmentPlan = {
      ...existing,
      ...data,
      updatedAt: now(),
    };
    await db.put(STORE_NAME, updated);
    return updated;
  },

  /**
   * Mark an action as completed
   */
  async completeAction(
    planId: string,
    actionId: string,
    completedBy: string,
    notes?: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const updatedActions = plan.actions.map((action) => {
      if (action.id === actionId) {
        return {
          ...action,
          completed: true,
          completedAt: now(),
          completedBy,
          notes: notes || action.notes,
        };
      }
      return action;
    });

    // Check if all actions are now complete
    const allComplete = updatedActions.every((a) => a.completed);

    return this.update(planId, {
      actions: updatedActions,
      status: allComplete ? "completed" : plan.status,
      completedAt: allComplete ? now() : undefined,
    });
  },

  /**
   * Approve a treatment plan
   */
  async approve(
    planId: string,
    approvedBy: string,
    modifications?: string
  ): Promise<TreatmentPlan | null> {
    return this.update(planId, {
      status: "active",
      approvedBy,
      approvedAt: now(),
      doctorResponse: modifications,
    });
  },

  /**
   * Cancel a treatment plan
   */
  async cancel(planId: string, reason?: string): Promise<TreatmentPlan | null> {
    return this.update(planId, {
      status: "cancelled",
      outcome: reason,
    });
  },

  /**
   * Complete a treatment plan with outcome notes
   */
  async complete(
    planId: string,
    outcome: string,
    outcomeEs?: string
  ): Promise<TreatmentPlan | null> {
    return this.update(planId, {
      status: "completed",
      completedAt: now(),
      outcome,
      outcomeEs,
    });
  },

  /**
   * Delete a treatment plan
   */
  async delete(id: string): Promise<boolean> {
    const db = await getDB();
    const existing = await db.get(STORE_NAME, id);
    if (!existing) return false;
    await db.delete(STORE_NAME, id);
    return true;
  },

  /**
   * Get count of active plans for a patient
   */
  async getActiveCount(patientId: string): Promise<number> {
    const active = await this.getActivePlans(patientId);
    return active.length;
  },

  /**
   * Add an amendment to a treatment plan
   */
  async addAmendment(
    planId: string,
    amendment: Omit<PlanAmendment, "id" | "occurredAt">
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const newAmendment: PlanAmendment = {
      ...amendment,
      id: generateId(),
      occurredAt: now(),
    };

    const amendments = [...(plan.amendments || []), newAmendment];

    return this.update(planId, {
      amendments,
      status: "modified",
    });
  },

  /**
   * Add a new action to an existing plan
   */
  async addAction(
    planId: string,
    action: Omit<TreatmentPlanAction, "id" | "completed" | "addedAt">,
    addedBy: string,
    reason: string,
    reasonEs: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const newAction: TreatmentPlanAction = {
      ...action,
      id: generateId(),
      completed: false,
      addedAt: now(),
      addedBy,
    };

    const actions = [...plan.actions, newAction];

    // Add amendment record
    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: "action_added",
      description: `Added: ${action.description}`,
      descriptionEs: `Agregado: ${action.descriptionEs}`,
      reason,
      reasonEs,
      amendedBy: addedBy,
      actionId: newAction.id,
      newValue: action.description,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      actions,
      amendments,
      status: "modified",
    });
  },

  /**
   * Remove an action from a plan (soft delete)
   */
  async removeAction(
    planId: string,
    actionId: string,
    removedBy: string,
    reason: string,
    reasonEs: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const targetAction = plan.actions.find((a) => a.id === actionId);
    if (!targetAction) return null;

    const actions = plan.actions.map((action) => {
      if (action.id === actionId) {
        return {
          ...action,
          isRemoved: true,
          removedAt: now(),
          removedBy,
        };
      }
      return action;
    });

    // Add amendment record
    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: "action_removed",
      description: `Removed: ${targetAction.description}`,
      descriptionEs: `Eliminado: ${targetAction.descriptionEs}`,
      reason,
      reasonEs,
      amendedBy: removedBy,
      actionId,
      previousValue: targetAction.description,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      actions,
      amendments,
      status: "modified",
    });
  },

  /**
   * Modify an existing action
   */
  async modifyAction(
    planId: string,
    actionId: string,
    updates: Partial<Pick<TreatmentPlanAction, "description" | "descriptionEs" | "dosage" | "timing" | "notes">>,
    modifiedBy: string,
    reason: string,
    reasonEs: string,
    amendmentType: AmendmentType = "action_modified"
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const targetAction = plan.actions.find((a) => a.id === actionId);
    if (!targetAction) return null;

    // Build previous value string
    const previousParts: string[] = [];
    if (updates.description && targetAction.description !== updates.description) {
      previousParts.push(`Description: ${targetAction.description}`);
    }
    if (updates.dosage && targetAction.dosage !== updates.dosage) {
      previousParts.push(`Dosage: ${targetAction.dosage || "none"}`);
    }
    if (updates.timing && targetAction.timing !== updates.timing) {
      previousParts.push(`Timing: ${targetAction.timing || "none"}`);
    }

    const actions = plan.actions.map((action) => {
      if (action.id === actionId) {
        return {
          ...action,
          ...updates,
        };
      }
      return action;
    });

    // Build new value string
    const newParts: string[] = [];
    if (updates.description) newParts.push(`Description: ${updates.description}`);
    if (updates.dosage) newParts.push(`Dosage: ${updates.dosage}`);
    if (updates.timing) newParts.push(`Timing: ${updates.timing}`);

    // Add amendment record
    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: amendmentType,
      description: `Modified action: ${targetAction.description}`,
      descriptionEs: `Acción modificada: ${targetAction.descriptionEs}`,
      reason,
      reasonEs,
      amendedBy: modifiedBy,
      actionId,
      previousValue: previousParts.join("; ") || undefined,
      newValue: newParts.join("; ") || undefined,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      actions,
      amendments,
      status: "modified",
    });
  },

  /**
   * Put a plan on hold
   */
  async holdPlan(
    planId: string,
    heldBy: string,
    reason: string,
    reasonEs: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    // Add amendment record
    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: "hold",
      description: "Plan put on hold",
      descriptionEs: "Plan en pausa",
      reason,
      reasonEs,
      amendedBy: heldBy,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      isOnHold: true,
      holdReason: reason,
      holdAt: now(),
      amendments,
    });
  },

  /**
   * Resume a plan from hold
   */
  async resumePlan(
    planId: string,
    resumedBy: string,
    notes?: string,
    notesEs?: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    // Add amendment record
    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: "resumed",
      description: notes || "Plan resumed",
      descriptionEs: notesEs || "Plan reanudado",
      reason: notes || "Ready to continue",
      reasonEs: notesEs || "Listo para continuar",
      amendedBy: resumedBy,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      isOnHold: false,
      holdReason: undefined,
      resumedAt: now(),
      amendments,
      status: "active",
    });
  },

  /**
   * Add a clinical update amendment (e.g., based on new lab results)
   */
  async addClinicalUpdate(
    planId: string,
    description: string,
    descriptionEs: string,
    reason: string,
    reasonEs: string,
    updatedBy: string,
    milaRecommended?: boolean,
    milaRationale?: string
  ): Promise<TreatmentPlan | null> {
    const plan = await this.getById(planId);
    if (!plan) return null;

    const amendment: PlanAmendment = {
      id: generateId(),
      occurredAt: now(),
      type: "clinical_update",
      description,
      descriptionEs,
      reason,
      reasonEs,
      amendedBy: updatedBy,
      milaRecommended,
      milaRationale,
    };

    const amendments = [...(plan.amendments || []), amendment];

    return this.update(planId, {
      amendments,
      status: "modified",
    });
  },
};
