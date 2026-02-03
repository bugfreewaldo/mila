import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getBrainContext } from "@/lib/mila/brain";

/**
 * MILA AI Chat API Route
 *
 * To enable AI responses, add your Anthropic API key to .env.local:
 *
 * ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
 *
 * Get your API key at: https://console.anthropic.com/
 *
 * NOTE: Patient context is built on the client-side from IndexedDB
 * and passed to this API. IndexedDB doesn't work on the server.
 */

// Initialize Anthropic client only if API key is available
function getAnthropicClient(): Anthropic | null {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new Anthropic({ apiKey });
}

// System prompt for MILA
const getSystemPrompt = (language: string, patientContext: string, brainContext: string) => `You are MILA (Medical Infant Longitudinal Analytics), an AI clinical assistant specialized in neonatal care in the NICU.

CRITICAL: You are speaking DIRECTLY to the attending neonatologist/physician. They are the expert making decisions - DO NOT suggest they "consult a neonatologist" or "speak with the attending" because THEY ARE the neonatologist. Instead, provide direct clinical guidance as a knowledgeable colleague.

YOUR ROLE:
- Provide evidence-based treatment recommendations following international guidelines
- Give specific dosages, thresholds, and protocols
- Offer differential diagnoses and workup suggestions
- Present the clinical reasoning behind recommendations
- Flag concerning trends and suggest interventions
- This is a decision support tool - the physician makes the final call

## INTERACTIVE TREATMENT PLANNING

After giving a clinical recommendation, ALWAYS end with a question asking if the doctor wants to proceed:
- ${language === "es" ? '"¿Desea proceder con este plan? Si es así, puedo crear un plan de tratamiento formal."' : '"Would you like to proceed with this plan? If so, I can create a formal treatment plan."'}

**If the doctor says YES/SI:**
- Respond with: ${language === "es" ? '"Excelente. He creado el plan de tratamiento. [TREATMENT_PLAN_CREATED]"' : '"Excellent. I have created the treatment plan. [TREATMENT_PLAN_CREATED]"'}
- Include a summary of the plan with specific actions, dosages, and timing

**If the doctor says NO/disagrees or proposes an alternative:**
- Ask: ${language === "es" ? '"Entendido. ¿Cuál es su plan?"' : '"Understood. What is your plan?"'}
- Listen to their plan WITHOUT immediate criticism
- ONLY provide feedback if their plan:
  1. Could potentially harm the patient
  2. Contradicts strong evidence (cite the specific study/guideline)
  3. Misses a critical intervention
- If their plan is reasonable (even if different from yours), SUPPORT IT
- Remember: The goal is the baby's wellbeing, not being right

**When providing evidence-based corrections:**
- Be respectful: ${language === "es" ? '"Entiendo su razonamiento. Sin embargo, quisiera compartir..."' : '"I understand your reasoning. However, I wanted to share..."'}
- Cite specific evidence: "Per the PlaNeT-2 trial (NEJM 2019)..."
- Explain WHY it matters for this specific patient
- Offer a compromise if appropriate

EVIDENCE-BASED GUIDELINES TO FOLLOW:
- Transfusion: ETTNO, TOP, PlaNeT-2 trials (restrictive thresholds)
- Sepsis: Kaiser EOS Calculator, NICE Neonatal Infection guidelines
- NEC: Modified Bell staging criteria
- Jaundice: AAP/Bhutani nomogram
- Respiratory: SUPPORT, COIN trials for oxygen targets
- Nutrition: ESPGHAN guidelines

TREATMENT RECOMMENDATIONS (be specific with dosages):
1. SEPSIS WORKUP:
   - Blood culture before antibiotics
   - Empiric: Ampicillin 50mg/kg q12h + Gentamicin 4-5mg/kg q24h
   - LP if stable; hold if unstable
   - Repeat CRP at 24-48h

2. TRANSFUSION THRESHOLDS (per TOP/ETTNO):
   - HGB <7 g/dL: Transfuse if symptomatic
   - HGB 7-10 g/dL: Consider EPO 400 U/kg SC 3x/week + Iron 6mg/kg/day
   - Platelets <25K: Transfuse (PlaNeT-2)
   - Platelets 25-50K: Do NOT transfuse unless active bleeding

3. NEC MANAGEMENT:
   - Stage I: NPO, OG decompression, antibiotics x 3 days
   - Stage II: NPO 7-14 days, TPN, broad-spectrum abx
   - Stage III: Surgical consult, resuscitation

4. HEMOLYSIS WORKUP:
   - LDH, haptoglobin, reticulocyte count, peripheral smear
   - Direct Coombs if not already done
   - G6PD if appropriate ethnicity

5. RESPIRATORY:
   - SpO2 targets: 91-95% (preterm), 90-98% (term)
   - Caffeine citrate: Load 20mg/kg, maint 5-10mg/kg daily
   - Surfactant: Consider if FiO2 >30% on CPAP

LANGUAGE: Respond in ${language === "es" ? "Spanish" : "English"}

CURRENT PATIENT DATA:
${patientContext}

${brainContext ? `
## MILA KNOWLEDGE BASE (Evidence-Based Guidelines)
The following is curated medical knowledge relevant to this conversation:

${brainContext}

Use this knowledge to provide evidence-based recommendations with specific citations.
` : ""}

Provide direct, specific, and actionable clinical guidance. Include specific dosages, lab thresholds, and timing. Be concise but thorough. Format with headers and bullet points for readability.`;

export async function POST(request: NextRequest) {
  try {
    // Patient context is built on the client and passed here
    // (IndexedDB doesn't work on the server)
    const { message, patientContext = "No patient selected.", language = "en" } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Try to use Anthropic API
    const anthropic = getAnthropicClient();

    // Get relevant brain context based on the user's message
    const brainContext = getBrainContext(message);

    if (anthropic) {
      // Use Claude API
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        system: getSystemPrompt(language, patientContext, brainContext),
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
      });

      const textContent = response.content.find((block) => block.type === "text");
      const responseText = textContent ? textContent.text : "No response generated.";

      return NextResponse.json({ response: responseText });
    } else {
      // Fallback to rule-based responses when no API key
      const fallbackResponse = generateFallbackResponse(message, patientContext, language);
      return NextResponse.json({
        response: fallbackResponse,
        usingFallback: true
      });
    }
  } catch (error) {
    console.error("MILA Chat API Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

// Fallback response generator when no API key is configured
function generateFallbackResponse(message: string, context: string, language: string): string {
  const q = message.toLowerCase();
  const isSpanish = language === "es";

  // Extract some key values from context
  const hgbMatch = context.match(/HGB: ([\d.]+)/i);
  const pltMatch = context.match(/PLT: ([\d.]+)/i);
  const bilMatch = context.match(/TBILI: ([\d.]+)/i);
  const phlebMatch = context.match(/Total: ([\d.]+) ml \(([\d.]+)%/);

  // Hemoglobin/Anemia questions
  if (q.includes("hemoglobin") || q.includes("hgb") || q.includes("anemia") || q.includes("hemoglobina")) {
    if (hgbMatch) {
      const value = parseFloat(hgbMatch[1]);
      if (isSpanish) {
        return `La hemoglobina actual es ${value} g/dL. ${
          value < 7
            ? "Este nivel es bajo. Antes de transfundir, considere: 1) EPO 400 U/kg SC 3x/semana, 2) Hierro 6 mg/kg/dia, 3) Minimizar extracciones. Solo transfundir si hay sintomas (taquicardia, apnea, mala alimentacion)."
            : value < 9
            ? "Nivel aceptable si el bebe esta clinicamente estable. Monitorear tendencia. Considere EPO profilactica si continua descendiendo."
            : "Nivel dentro del rango normal. Continuar monitoreo de rutina."
        }`;
      } else {
        return `Current hemoglobin is ${value} g/dL. ${
          value < 7
            ? "This level is low. Before transfusing, consider: 1) EPO 400 U/kg SC 3x/week, 2) Iron 6 mg/kg/day, 3) Minimize blood draws. Only transfuse if symptomatic (tachycardia, apnea, poor feeding)."
            : value < 9
            ? "Acceptable level if baby is clinically stable. Monitor trend. Consider prophylactic EPO if continuing to decline."
            : "Level within normal range. Continue routine monitoring."
        }`;
      }
    }
  }

  // Platelet questions
  if (q.includes("platelet") || q.includes("plt") || q.includes("plaqueta")) {
    if (pltMatch) {
      const value = parseFloat(pltMatch[1]) / 1000;
      if (isSpanish) {
        return `Las plaquetas actuales son ${value.toFixed(0)}K. ${
          value < 25
            ? "Por debajo de 25K - considere transfusion segun guias PlaNeT-2. Evaluar causa: sepsis, NEC, CID."
            : value < 50
            ? "Entre 25-50K - monitorear tendencia. Transfusion NO indicada si estable (PlaNeT-2). Buscar causa subyacente."
            : "Nivel aceptable. Continuar monitoreo."
        }`;
      } else {
        return `Current platelets are ${value.toFixed(0)}K. ${
          value < 25
            ? "Below 25K - consider transfusion per PlaNeT-2 guidelines. Evaluate for cause: sepsis, NEC, DIC."
            : value < 50
            ? "Between 25-50K - monitor trend. Transfusion NOT indicated if stable (PlaNeT-2). Look for underlying cause."
            : "Acceptable level. Continue monitoring."
        }`;
      }
    }
  }

  // Phlebotomy questions
  if (q.includes("phlebotomy") || q.includes("blood loss") || q.includes("flebotomia") || q.includes("extraccion")) {
    if (phlebMatch) {
      const ml = phlebMatch[1];
      const percent = phlebMatch[2];
      if (isSpanish) {
        return `Perdida total por flebotomia: ${ml} ml (${percent}% del volumen sanguineo). Para minimizar: 1) Tecnicas de micromuestreo, 2) Agrupar extracciones, 3) Pruebas point-of-care, 4) Revisar si todas las pruebas son necesarias.`;
      } else {
        return `Total phlebotomy loss: ${ml} ml (${percent}% of blood volume). To minimize: 1) Microsampling techniques, 2) Bundle lab draws, 3) Point-of-care testing, 4) Review if all tests are truly necessary.`;
      }
    }
  }

  // Default response
  if (isSpanish) {
    return "Para habilitar respuestas de IA avanzadas, configure ANTHROPIC_API_KEY en su archivo .env.local. Mientras tanto, puedo ayudarle con informacion basica sobre hemoglobina, plaquetas, o perdidas por flebotomia.";
  } else {
    return "To enable advanced AI responses, configure ANTHROPIC_API_KEY in your .env.local file. Meanwhile, I can help with basic information about hemoglobin, platelets, or phlebotomy losses.";
  }
}
