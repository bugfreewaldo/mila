/**
 * MILA Brain - Curated Medical Knowledge Base
 *
 * This module provides evidence-based medical knowledge for MILA to reference
 * when making clinical recommendations. All data is curated from peer-reviewed
 * sources and established clinical guidelines.
 *
 * Categories:
 * - guidelines: Evidence-based clinical guidelines (ETTNO, TOP, PlaNeT-2, AAP, NICE)
 * - protocols: Clinical protocols for common NICU conditions
 * - drugs: Neonatal drug dosing and safety information
 * - labs: Lab interpretation guides with neonatal-specific ranges
 */

// Re-export all knowledge modules
export * from "./types";
export * from "./guidelines/transfusion";
export * from "./protocols/anemia";
export * from "./protocols/sepsis";
export * from "./protocols/jaundice";
export * from "./drugs/common-nicu-drugs";
export * from "./labs/reference-ranges";

// Brain context builder for MILA prompts
import { TRANSFUSION_GUIDELINES } from "./guidelines/transfusion";
import { ANEMIA_PROTOCOL } from "./protocols/anemia";
import { SEPSIS_PROTOCOL } from "./protocols/sepsis";
import { JAUNDICE_PROTOCOL } from "./protocols/jaundice";
import { COMMON_NICU_DRUGS } from "./drugs/common-nicu-drugs";
import { LAB_REFERENCE_RANGES } from "./labs/reference-ranges";

/**
 * Get relevant brain context based on the clinical topic
 */
export function getBrainContext(topic: string): string {
  const topicLower = topic.toLowerCase();
  const contexts: string[] = [];

  // Transfusion-related queries
  if (
    topicLower.includes("transfusion") ||
    topicLower.includes("blood") ||
    topicLower.includes("rbc") ||
    topicLower.includes("platelet") ||
    topicLower.includes("hemoglobin") ||
    topicLower.includes("hgb") ||
    topicLower.includes("anemia")
  ) {
    contexts.push(formatGuideline(TRANSFUSION_GUIDELINES));
    contexts.push(formatProtocol(ANEMIA_PROTOCOL));
  }

  // Sepsis-related queries
  if (
    topicLower.includes("sepsis") ||
    topicLower.includes("infection") ||
    topicLower.includes("antibiotic") ||
    topicLower.includes("culture") ||
    topicLower.includes("crp") ||
    topicLower.includes("fever")
  ) {
    contexts.push(formatProtocol(SEPSIS_PROTOCOL));
  }

  // Jaundice-related queries
  if (
    topicLower.includes("jaundice") ||
    topicLower.includes("bilirubin") ||
    topicLower.includes("phototherapy") ||
    topicLower.includes("exchange") ||
    topicLower.includes("ictericia")
  ) {
    contexts.push(formatProtocol(JAUNDICE_PROTOCOL));
  }

  // Drug-related queries
  if (
    topicLower.includes("dose") ||
    topicLower.includes("dosing") ||
    topicLower.includes("medication") ||
    topicLower.includes("drug") ||
    topicLower.includes("caffeine") ||
    topicLower.includes("gentamicin") ||
    topicLower.includes("ampicillin")
  ) {
    contexts.push(formatDrugs(COMMON_NICU_DRUGS));
  }

  // Lab-related queries
  if (
    topicLower.includes("lab") ||
    topicLower.includes("normal") ||
    topicLower.includes("range") ||
    topicLower.includes("result") ||
    topicLower.includes("interpret")
  ) {
    contexts.push(formatLabRanges(LAB_REFERENCE_RANGES));
  }

  if (contexts.length === 0) {
    // Return general overview for unmatched topics
    return `
MILA has access to evidence-based guidelines including:
- Transfusion thresholds (ETTNO, TOP, PlaNeT-2 trials)
- Sepsis evaluation protocols (AAP, NICE)
- Jaundice management (AAP guidelines)
- Neonatal drug dosing references
- Lab interpretation guides with neonatal-specific ranges
    `.trim();
  }

  return contexts.join("\n\n---\n\n");
}

function formatGuideline(guideline: typeof TRANSFUSION_GUIDELINES): string {
  return `
## ${guideline.title}
Source: ${guideline.sources.join(", ")}
Last Updated: ${guideline.lastUpdated}

### Key Points:
${guideline.keyPoints.map((p) => `- ${p}`).join("\n")}

### Thresholds:
${Object.entries(guideline.thresholds)
  .map(([key, val]) => `- ${key}: ${JSON.stringify(val)}`)
  .join("\n")}
  `.trim();
}

function formatProtocol(protocol: { title: string; description: string; steps: { step: number; action: string; details: string }[]; references: string[] }): string {
  return `
## ${protocol.title}
${protocol.description}

### Steps:
${protocol.steps.map((s) => `${s.step}. **${s.action}**: ${s.details}`).join("\n")}

References: ${protocol.references.join(", ")}
  `.trim();
}

function formatDrugs(drugs: typeof COMMON_NICU_DRUGS): string {
  const drugList = drugs.drugs
    .slice(0, 10)
    .map(
      (d) =>
        `- **${d.name}**: ${d.indication}. Dose: ${d.dose}, Route: ${d.route}, Frequency: ${d.frequency}`
    )
    .join("\n");

  return `
## Common NICU Medications Reference

${drugList}

Note: Always verify doses and check for contraindications before prescribing.
  `.trim();
}

function formatLabRanges(labs: typeof LAB_REFERENCE_RANGES): string {
  const labList = labs.ranges
    .slice(0, 15)
    .map(
      (l) =>
        `- **${l.name}** (${l.shortName}): ${l.neonatalRange.low}-${l.neonatalRange.high} ${l.unit}`
    )
    .join("\n");

  return `
## Neonatal Lab Reference Ranges

${labList}

Note: Ranges may vary by gestational age and postnatal age. Critical values require immediate attention.
  `.trim();
}
