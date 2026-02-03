import type { LabTypeDefinition } from "../types/domain";

/**
 * Lab Type Definitions
 *
 * Reference data for common neonatal lab tests.
 * Reference ranges are for term/near-term neonates.
 */

export const LAB_TYPES: LabTypeDefinition[] = [
  // Hematology
  {
    id: "hgb",
    name: "Hemoglobin",
    shortName: "Hgb",
    category: "hematology",
    unit: "g/dL",
    neonatalRefRangeLow: 13.5,
    neonatalRefRangeHigh: 19.5,
    criticalLow: 7.0,
    criticalHigh: 24.0,
  },
  {
    id: "hct",
    name: "Hematocrit",
    shortName: "Hct",
    category: "hematology",
    unit: "%",
    neonatalRefRangeLow: 42,
    neonatalRefRangeHigh: 65,
    criticalLow: 20,
    criticalHigh: 70,
  },
  {
    id: "wbc",
    name: "White Blood Cell Count",
    shortName: "WBC",
    category: "hematology",
    unit: "K/uL",
    neonatalRefRangeLow: 9.0,
    neonatalRefRangeHigh: 30.0,
    criticalLow: 2.0,
    criticalHigh: 50.0,
  },
  {
    id: "plt",
    name: "Platelet Count",
    shortName: "Plt",
    category: "hematology",
    unit: "K/uL",
    neonatalRefRangeLow: 150,
    neonatalRefRangeHigh: 450,
    criticalLow: 50,
    criticalHigh: 1000,
  },
  {
    id: "retic",
    name: "Reticulocyte Count",
    shortName: "Retic",
    category: "hematology",
    unit: "%",
    neonatalRefRangeLow: 3.0,
    neonatalRefRangeHigh: 7.0,
  },

  // Chemistry - Basic Metabolic Panel
  {
    id: "na",
    name: "Sodium",
    shortName: "Na",
    category: "chemistry",
    unit: "mEq/L",
    neonatalRefRangeLow: 135,
    neonatalRefRangeHigh: 145,
    criticalLow: 120,
    criticalHigh: 160,
  },
  {
    id: "k",
    name: "Potassium",
    shortName: "K",
    category: "chemistry",
    unit: "mEq/L",
    neonatalRefRangeLow: 3.5,
    neonatalRefRangeHigh: 6.0,
    criticalLow: 2.5,
    criticalHigh: 7.0,
  },
  {
    id: "cl",
    name: "Chloride",
    shortName: "Cl",
    category: "chemistry",
    unit: "mEq/L",
    neonatalRefRangeLow: 98,
    neonatalRefRangeHigh: 106,
  },
  {
    id: "co2",
    name: "Carbon Dioxide",
    shortName: "CO2",
    category: "chemistry",
    unit: "mEq/L",
    neonatalRefRangeLow: 20,
    neonatalRefRangeHigh: 28,
  },
  {
    id: "bun",
    name: "Blood Urea Nitrogen",
    shortName: "BUN",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 3,
    neonatalRefRangeHigh: 25,
  },
  {
    id: "cr",
    name: "Creatinine",
    shortName: "Cr",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 0.2,
    neonatalRefRangeHigh: 1.0,
    criticalHigh: 2.0,
  },
  {
    id: "glu",
    name: "Glucose",
    shortName: "Glu",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 40,
    neonatalRefRangeHigh: 100,
    criticalLow: 30,
    criticalHigh: 400,
  },
  {
    id: "ca",
    name: "Calcium",
    shortName: "Ca",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 7.6,
    neonatalRefRangeHigh: 10.4,
    criticalLow: 6.0,
    criticalHigh: 13.0,
  },
  {
    id: "mg",
    name: "Magnesium",
    shortName: "Mg",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 1.5,
    neonatalRefRangeHigh: 2.5,
  },
  {
    id: "phos",
    name: "Phosphorus",
    shortName: "Phos",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 4.5,
    neonatalRefRangeHigh: 9.0,
  },

  // Hemolysis Markers
  {
    id: "ldh",
    name: "Lactate Dehydrogenase",
    shortName: "LDH",
    category: "chemistry",
    unit: "U/L",
    neonatalRefRangeLow: 200,
    neonatalRefRangeHigh: 600,
    criticalHigh: 1200,
  },
  {
    id: "hapto",
    name: "Haptoglobin",
    shortName: "Hapto",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 30,
    neonatalRefRangeHigh: 180,
    criticalLow: 10,
  },

  // Sepsis/Infection Markers
  {
    id: "crp",
    name: "C-Reactive Protein",
    shortName: "CRP",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 0,
    neonatalRefRangeHigh: 1.0,
    criticalHigh: 5.0,
  },
  {
    id: "pct",
    name: "Procalcitonin",
    shortName: "PCT",
    category: "chemistry",
    unit: "ng/mL",
    neonatalRefRangeLow: 0,
    neonatalRefRangeHigh: 0.5,
    criticalHigh: 10.0,
  },
  {
    id: "it_ratio",
    name: "I:T Ratio (Immature/Total Neutrophils)",
    shortName: "I:T",
    category: "hematology",
    unit: "",
    neonatalRefRangeLow: 0,
    neonatalRefRangeHigh: 0.12,
    criticalHigh: 0.3,
  },

  // Liver Function
  {
    id: "tbili",
    name: "Total Bilirubin",
    shortName: "TBili",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 0.3,
    neonatalRefRangeHigh: 12.0,
    criticalHigh: 20.0,
  },
  {
    id: "dbili",
    name: "Direct Bilirubin",
    shortName: "DBili",
    category: "chemistry",
    unit: "mg/dL",
    neonatalRefRangeLow: 0,
    neonatalRefRangeHigh: 0.4,
    criticalHigh: 2.0,
  },
  {
    id: "ast",
    name: "Aspartate Aminotransferase",
    shortName: "AST",
    category: "chemistry",
    unit: "U/L",
    neonatalRefRangeLow: 25,
    neonatalRefRangeHigh: 75,
  },
  {
    id: "alt",
    name: "Alanine Aminotransferase",
    shortName: "ALT",
    category: "chemistry",
    unit: "U/L",
    neonatalRefRangeLow: 6,
    neonatalRefRangeHigh: 50,
  },

  // Blood Gas
  {
    id: "ph",
    name: "pH",
    shortName: "pH",
    category: "blood_gas",
    unit: "",
    neonatalRefRangeLow: 7.30,
    neonatalRefRangeHigh: 7.45,
    criticalLow: 7.10,
    criticalHigh: 7.60,
  },
  {
    id: "pco2",
    name: "Partial Pressure of CO2",
    shortName: "pCO2",
    category: "blood_gas",
    unit: "mmHg",
    neonatalRefRangeLow: 35,
    neonatalRefRangeHigh: 50,
    criticalLow: 20,
    criticalHigh: 70,
  },
  {
    id: "po2",
    name: "Partial Pressure of O2",
    shortName: "pO2",
    category: "blood_gas",
    unit: "mmHg",
    neonatalRefRangeLow: 50,
    neonatalRefRangeHigh: 80,
    criticalLow: 40,
    criticalHigh: 100,
  },
  {
    id: "hco3",
    name: "Bicarbonate",
    shortName: "HCO3",
    category: "blood_gas",
    unit: "mEq/L",
    neonatalRefRangeLow: 18,
    neonatalRefRangeHigh: 26,
    criticalLow: 10,
    criticalHigh: 40,
  },
  {
    id: "be",
    name: "Base Excess",
    shortName: "BE",
    category: "blood_gas",
    unit: "mEq/L",
    neonatalRefRangeLow: -4,
    neonatalRefRangeHigh: 4,
    criticalLow: -10,
    criticalHigh: 10,
  },
  {
    id: "lactate",
    name: "Lactate",
    shortName: "Lac",
    category: "blood_gas",
    unit: "mmol/L",
    neonatalRefRangeLow: 0.5,
    neonatalRefRangeHigh: 2.2,
    criticalHigh: 4.0,
  },

  // Coagulation
  {
    id: "pt",
    name: "Prothrombin Time",
    shortName: "PT",
    category: "coagulation",
    unit: "sec",
    neonatalRefRangeLow: 11,
    neonatalRefRangeHigh: 15,
  },
  {
    id: "inr",
    name: "International Normalized Ratio",
    shortName: "INR",
    category: "coagulation",
    unit: "",
    neonatalRefRangeLow: 0.9,
    neonatalRefRangeHigh: 1.3,
    criticalHigh: 4.0,
  },
  {
    id: "ptt",
    name: "Partial Thromboplastin Time",
    shortName: "PTT",
    category: "coagulation",
    unit: "sec",
    neonatalRefRangeLow: 25,
    neonatalRefRangeHigh: 60,
    criticalHigh: 100,
  },
  {
    id: "fibrinogen",
    name: "Fibrinogen",
    shortName: "Fib",
    category: "coagulation",
    unit: "mg/dL",
    neonatalRefRangeLow: 150,
    neonatalRefRangeHigh: 350,
    criticalLow: 100,
  },
];

/**
 * Get lab type by ID
 */
export function getLabType(id: string): LabTypeDefinition | undefined {
  return LAB_TYPES.find((lt) => lt.id === id);
}

/**
 * Get lab types by category
 */
export function getLabTypesByCategory(
  category: LabTypeDefinition["category"]
): LabTypeDefinition[] {
  return LAB_TYPES.filter((lt) => lt.category === category);
}

/**
 * Get all lab type IDs
 */
export function getLabTypeIds(): string[] {
  return LAB_TYPES.map((lt) => lt.id);
}

/**
 * Check if a value is abnormal for a given lab type
 */
export function isAbnormal(labTypeId: string, value: number): boolean {
  const labType = getLabType(labTypeId);
  if (!labType) return false;

  if (
    labType.neonatalRefRangeLow !== undefined &&
    value < labType.neonatalRefRangeLow
  ) {
    return true;
  }
  if (
    labType.neonatalRefRangeHigh !== undefined &&
    value > labType.neonatalRefRangeHigh
  ) {
    return true;
  }
  return false;
}

/**
 * Check if a value is critical for a given lab type
 */
export function isCritical(labTypeId: string, value: number): boolean {
  const labType = getLabType(labTypeId);
  if (!labType) return false;

  if (labType.criticalLow !== undefined && value < labType.criticalLow) {
    return true;
  }
  if (labType.criticalHigh !== undefined && value > labType.criticalHigh) {
    return true;
  }
  return false;
}
