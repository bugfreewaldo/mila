/**
 * Common NICU Medications Reference
 *
 * Dosing information for commonly used neonatal medications.
 * Always verify with pharmacy and current formulary.
 */

import type { DrugReference } from "../types";

export const COMMON_NICU_DRUGS = {
  id: "common-nicu-drugs-2024",
  title: "Common NICU Medications Reference",
  titleEs: "Referencia de Medicamentos Comunes en UCIN",
  lastUpdated: "2024-12-01",
  disclaimer:
    "This reference is for educational purposes. Always verify doses with current formulary and adjust for patient-specific factors.",
  disclaimerEs:
    "Esta referencia es para fines educativos. Siempre verificar dosis con el formulario actual y ajustar según factores específicos del paciente.",

  drugs: [
    // ANTIBIOTICS
    {
      id: "ampicillin",
      name: "Ampicillin",
      genericName: "Ampicillin sodium",
      category: "antibiotic" as const,
      indication: "GBS, Listeria, E. coli (non-ESBL), empiric EOS coverage",
      indicationEs: "GBS, Listeria, E. coli (no-BLEE), cobertura empírica EOS",
      dose: "25-50 mg/kg/dose",
      dosePerKg: "25-50 mg/kg",
      route: "IV",
      frequency: "q8-12h (based on GA/PNA); q6h for meningitis",
      maxDose: "2g/dose",
      adjustments: [
        { condition: "GA <30 wk, PNA 0-14 days", adjustment: "q12h" },
        { condition: "GA ≥30 wk, PNA 0-7 days", adjustment: "q12h" },
        { condition: "GA ≥30 wk, PNA >7 days", adjustment: "q8h" },
        { condition: "Meningitis", adjustment: "100 mg/kg/dose q6h" },
      ],
      contraindications: ["Penicillin allergy"],
      sideEffects: ["Rash", "Diarrhea", "Eosinophilia"],
      monitoring: ["Clinical response", "CBC"],
    },
    {
      id: "gentamicin",
      name: "Gentamicin",
      genericName: "Gentamicin sulfate",
      category: "antibiotic" as const,
      indication: "Gram-negative coverage, synergy with ampicillin for GBS/Listeria",
      indicationEs: "Cobertura gram-negativa, sinergia con ampicilina para GBS/Listeria",
      dose: "4-5 mg/kg/dose",
      dosePerKg: "4-5 mg/kg",
      route: "IV",
      frequency: "q24-48h (extended interval dosing based on GA/PNA)",
      adjustments: [
        { condition: "GA <30 wk", adjustment: "q48h" },
        { condition: "GA 30-34 wk", adjustment: "q36h" },
        { condition: "GA ≥35 wk", adjustment: "q24h" },
      ],
      contraindications: ["Previous aminoglycoside nephrotoxicity/ototoxicity"],
      sideEffects: ["Nephrotoxicity", "Ototoxicity", "Neuromuscular blockade"],
      monitoring: ["Trough before 3rd dose (goal <1 mcg/mL)", "Creatinine", "Hearing screen"],
    },
    {
      id: "vancomycin",
      name: "Vancomycin",
      genericName: "Vancomycin hydrochloride",
      category: "antibiotic" as const,
      indication: "MRSA, CoNS, empiric LOS coverage, concern for line infection",
      indicationEs: "SARM, CoNS, cobertura empírica LOS, sospecha de infección de línea",
      dose: "10-15 mg/kg/dose",
      dosePerKg: "10-15 mg/kg",
      route: "IV over 60 min",
      frequency: "q8-24h (based on GA/PNA)",
      adjustments: [
        { condition: "GA <29 wk, PNA 0-14 days", adjustment: "q18-24h" },
        { condition: "GA 29-35 wk, PNA 0-14 days", adjustment: "q12-18h" },
        { condition: "GA >35 wk", adjustment: "q8-12h" },
        { condition: "Meningitis", adjustment: "Target trough 15-20 mcg/mL" },
      ],
      contraindications: ["Previous vancomycin anaphylaxis (rare)"],
      sideEffects: ["Red man syndrome (infuse slowly)", "Nephrotoxicity", "Ototoxicity"],
      monitoring: ["Trough before 4th dose (goal 10-15 mcg/mL for bacteremia, 15-20 for meningitis)", "Creatinine"],
    },
    {
      id: "cefotaxime",
      name: "Cefotaxime",
      genericName: "Cefotaxime sodium",
      category: "antibiotic" as const,
      indication: "Meningitis, gram-negative coverage with CNS penetration",
      indicationEs: "Meningitis, cobertura gram-negativa con penetración SNC",
      dose: "50 mg/kg/dose",
      dosePerKg: "50 mg/kg",
      route: "IV",
      frequency: "q8-12h (based on GA/PNA); q6h for meningitis",
      adjustments: [
        { condition: "GA <30 wk, PNA 0-14 days", adjustment: "q12h" },
        { condition: "GA ≥30 wk, PNA >7 days", adjustment: "q8h" },
        { condition: "Meningitis", adjustment: "q6h" },
      ],
      contraindications: ["Cephalosporin allergy"],
      sideEffects: ["Diarrhea", "Rash", "Eosinophilia"],
      monitoring: ["Clinical response", "CBC"],
      notes: "Good CSF penetration; not active against Listeria (need ampicillin)",
    },

    // RESPIRATORY
    {
      id: "caffeine_citrate",
      name: "Caffeine Citrate",
      genericName: "Caffeine citrate",
      category: "respiratory" as const,
      indication: "Apnea of prematurity, facilitation of extubation",
      indicationEs: "Apnea de la prematuridad, facilitación de extubación",
      dose: "Loading: 20 mg/kg; Maintenance: 5-10 mg/kg/day",
      dosePerKg: "5-10 mg/kg/day maintenance",
      route: "IV or PO",
      frequency: "Daily",
      adjustments: [
        { condition: "Persistent apnea", adjustment: "Increase to 10 mg/kg/day" },
      ],
      contraindications: ["Severe tachycardia"],
      sideEffects: ["Tachycardia", "Jitteriness", "Feeding intolerance", "Diuresis"],
      monitoring: ["Heart rate", "Apnea events", "Serum level if poor response (therapeutic 5-25 mcg/mL)"],
      notes: "Typically continue until 34-36 weeks PMA and apnea-free for 5-7 days",
    },
    {
      id: "surfactant",
      name: "Surfactant (Poractant alfa)",
      genericName: "Poractant alfa (Curosurf)",
      category: "respiratory" as const,
      indication: "RDS treatment and prevention in preterm infants",
      indicationEs: "Tratamiento y prevención de SDR en prematuros",
      dose: "Initial: 200 mg/kg (2.5 mL/kg); Repeat: 100 mg/kg (1.25 mL/kg)",
      dosePerKg: "200 mg/kg initial",
      route: "Intratracheal",
      frequency: "May repeat q12h x 2 additional doses if still intubated with FiO2 >0.3",
      contraindications: ["Pulmonary hemorrhage (relative)", "Pneumothorax (treat first)"],
      sideEffects: ["Transient bradycardia", "Oxygen desaturation", "Pulmonary hemorrhage"],
      monitoring: ["SpO2 during administration", "CXR post-dose if concerns", "Wean FiO2/ventilator as tolerated"],
    },

    // CARDIOVASCULAR
    {
      id: "dopamine",
      name: "Dopamine",
      genericName: "Dopamine hydrochloride",
      category: "cardiovascular" as const,
      indication: "Hypotension, low cardiac output states",
      indicationEs: "Hipotensión, estados de bajo gasto cardíaco",
      dose: "2-20 mcg/kg/min",
      dosePerKg: "Start 5 mcg/kg/min",
      route: "IV continuous infusion (central line preferred)",
      frequency: "Continuous",
      adjustments: [
        { condition: "Low dose (2-5 mcg/kg/min)", adjustment: "Dopaminergic effects (renal)" },
        { condition: "Moderate (5-10 mcg/kg/min)", adjustment: "Beta effects (inotropy)" },
        { condition: "High (>10 mcg/kg/min)", adjustment: "Alpha effects (vasoconstriction)" },
      ],
      contraindications: ["Pheochromocytoma", "Tachydysrhythmias"],
      sideEffects: ["Tachycardia", "Arrhythmias", "Tissue necrosis if extravasation"],
      monitoring: ["Continuous BP", "HR", "Urine output", "Lactate", "Check IV site frequently"],
    },
    {
      id: "dobutamine",
      name: "Dobutamine",
      genericName: "Dobutamine hydrochloride",
      category: "cardiovascular" as const,
      indication: "Low cardiac output, cardiogenic shock, post-surgical cardiac support",
      indicationEs: "Bajo gasto cardíaco, shock cardiogénico, soporte cardíaco post-quirúrgico",
      dose: "2-20 mcg/kg/min",
      dosePerKg: "Start 5 mcg/kg/min",
      route: "IV continuous infusion",
      frequency: "Continuous",
      contraindications: ["Hypertrophic cardiomyopathy (relative)", "Tachydysrhythmias"],
      sideEffects: ["Tachycardia", "Arrhythmias", "Hypotension (peripheral vasodilation at high doses)"],
      monitoring: ["Continuous BP and HR", "Echocardiogram for cardiac function"],
    },
    {
      id: "ibuprofen_lysine",
      name: "Ibuprofen Lysine (NeoProfen)",
      genericName: "Ibuprofen lysine",
      category: "cardiovascular" as const,
      indication: "Medical closure of hemodynamically significant PDA",
      indicationEs: "Cierre médico de PDA hemodinámicamente significativo",
      dose: "Initial: 10 mg/kg IV, then 5 mg/kg at 24h and 48h",
      dosePerKg: "10 mg/kg initial, 5 mg/kg x 2",
      route: "IV over 15 minutes",
      frequency: "3 doses total over 48 hours",
      contraindications: [
        "Active bleeding (IVH, pulmonary hemorrhage)",
        "NEC or suspected NEC",
        "Significant renal impairment (Cr >1.8 or oliguria)",
        "Thrombocytopenia <60,000",
        "Ductal-dependent cardiac lesion",
      ],
      sideEffects: ["Oliguria", "Elevated creatinine", "GI bleeding", "Platelet dysfunction"],
      monitoring: ["Creatinine before each dose", "Urine output", "Platelet count", "Echo for PDA closure"],
    },

    // ANALGESICS/SEDATION
    {
      id: "morphine",
      name: "Morphine",
      genericName: "Morphine sulfate",
      category: "analgesic" as const,
      indication: "Pain management, sedation for mechanical ventilation",
      indicationEs: "Manejo del dolor, sedación para ventilación mecánica",
      dose: "0.05-0.1 mg/kg/dose IV q4h PRN; or infusion 10-20 mcg/kg/hr",
      dosePerKg: "0.05-0.1 mg/kg/dose",
      route: "IV slow push or continuous infusion",
      frequency: "q4h PRN or continuous",
      contraindications: ["Severe respiratory depression without airway control"],
      sideEffects: [
        "Respiratory depression",
        "Hypotension",
        "Urinary retention",
        "Decreased GI motility",
        "Withdrawal with prolonged use",
      ],
      monitoring: ["Respiratory status", "Pain scores", "Blood pressure", "Bowel function"],
    },
    {
      id: "fentanyl",
      name: "Fentanyl",
      genericName: "Fentanyl citrate",
      category: "analgesic" as const,
      indication: "Analgesia, procedural sedation, intubation",
      indicationEs: "Analgesia, sedación para procedimientos, intubación",
      dose: "1-2 mcg/kg/dose IV; infusion 1-3 mcg/kg/hr",
      dosePerKg: "1-2 mcg/kg/dose",
      route: "IV slow push or continuous infusion",
      frequency: "PRN or continuous",
      contraindications: ["Severe respiratory depression without airway control"],
      sideEffects: [
        "Respiratory depression",
        "Chest wall rigidity (with rapid administration)",
        "Bradycardia",
        "Withdrawal with prolonged use",
      ],
      monitoring: ["Respiratory status", "Heart rate", "Pain scores"],
      notes: "Give slowly over 3-5 minutes to avoid chest wall rigidity",
    },

    // VITAMINS/SUPPLEMENTS
    {
      id: "vitamin_k",
      name: "Vitamin K1 (Phytonadione)",
      genericName: "Phytonadione",
      category: "vitamin" as const,
      indication: "Prevention of vitamin K deficiency bleeding (VKDB)",
      indicationEs: "Prevención de sangrado por deficiencia de vitamina K",
      dose: "0.5-1 mg IM (0.5 mg if <1500g; 1 mg if ≥1500g)",
      dosePerKg: "0.5-1 mg total",
      route: "IM (preferred) or IV (if IM contraindicated)",
      frequency: "Single dose at birth",
      contraindications: [],
      sideEffects: ["Rare: pain at injection site"],
      monitoring: [],
      notes: "Administer within 6 hours of birth. IV should be given very slowly if used.",
    },
    {
      id: "iron_supplement",
      name: "Iron Supplement",
      genericName: "Ferrous sulfate / Iron polysaccharide",
      category: "vitamin" as const,
      indication: "Prevention and treatment of iron deficiency anemia in preterm infants",
      indicationEs: "Prevención y tratamiento de anemia ferropénica en prematuros",
      dose: "2-4 mg/kg/day elemental iron (up to 6 mg/kg if on EPO)",
      dosePerKg: "2-4 mg/kg/day",
      route: "PO",
      frequency: "Daily or divided BID",
      adjustments: [
        { condition: "On EPO therapy", adjustment: "3-6 mg/kg/day" },
        { condition: "ELBW infant", adjustment: "Start at 2 mg/kg/day, increase as tolerated" },
      ],
      contraindications: ["Active GI bleeding", "Hemochromatosis"],
      sideEffects: ["GI upset", "Constipation", "Dark stools", "Staining of teeth (liquid)"],
      monitoring: ["Reticulocyte count", "Hgb/Hct", "Ferritin if prolonged therapy"],
      notes: "Start when on full enteral feeds (~120 mL/kg/day). Continue through first year.",
    },
    {
      id: "vitamin_d",
      name: "Vitamin D",
      genericName: "Cholecalciferol (Vitamin D3)",
      category: "vitamin" as const,
      indication: "Prevention of rickets and vitamin D deficiency",
      indicationEs: "Prevención de raquitismo y deficiencia de vitamina D",
      dose: "400-1000 IU/day",
      dosePerKg: "400 IU/day standard; up to 1000 IU/day for VLBW or documented deficiency",
      route: "PO",
      frequency: "Daily",
      contraindications: ["Hypercalcemia"],
      sideEffects: ["Hypercalcemia (with excessive doses)"],
      monitoring: ["25-OH vitamin D level if concerns", "Calcium if on high doses"],
      notes: "Start when on enteral feeds. Human milk-fed infants need supplementation.",
    },
  ] as DrugReference[],
};

/**
 * Get drug information by name
 */
export function getDrugByName(name: string): DrugReference | undefined {
  return COMMON_NICU_DRUGS.drugs.find(
    (d) =>
      d.name.toLowerCase() === name.toLowerCase() ||
      d.genericName.toLowerCase().includes(name.toLowerCase()) ||
      d.id === name.toLowerCase()
  );
}

/**
 * Get drugs by category
 */
export function getDrugsByCategory(category: DrugReference["category"]): DrugReference[] {
  return COMMON_NICU_DRUGS.drugs.filter((d) => d.category === category);
}

/**
 * Calculate dose for a specific patient weight
 */
export function calculateDose(
  drugId: string,
  weightKg: number
): { drug: string; calculatedDose: string; notes: string } | null {
  const drug = COMMON_NICU_DRUGS.drugs.find((d) => d.id === drugId);
  if (!drug || !drug.dosePerKg) return null;

  // Simple extraction of dose number for calculation
  const doseMatch = drug.dosePerKg.match(/(\d+(?:\.\d+)?(?:-\d+(?:\.\d+)?)?)\s*mg\/kg/);
  if (!doseMatch) return null;

  const doseRange = doseMatch[1];
  const [minDose, maxDose] = doseRange.includes("-") ? doseRange.split("-").map(Number) : [Number(doseRange), Number(doseRange)];

  const calculatedMin = (minDose * weightKg).toFixed(2);
  const calculatedMax = (maxDose * weightKg).toFixed(2);

  return {
    drug: drug.name,
    calculatedDose:
      calculatedMin === calculatedMax
        ? `${calculatedMin} mg`
        : `${calculatedMin} - ${calculatedMax} mg`,
    notes: `Based on ${drug.dosePerKg} for ${weightKg} kg patient. Frequency: ${drug.frequency}. Always verify with pharmacy.`,
  };
}
