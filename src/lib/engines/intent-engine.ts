import { extractIntent as geminiExtractIntent, type ExtractedIntent } from '../gemini';
import { IntentLockSchema, type IntentLockInput } from '../types';

export interface IntentEngineResult {
  success: boolean;
  intent?: IntentLockInput;
  rawExtraction?: ExtractedIntent;
  errors?: any;
}

/**
 * Extracts intent via LLM, then enforces structural validity via Zod.
 * This ensures the LLM's output conforms to our deterministic schema before we create a lock.
 */
export async function processUserPrompt(prompt: string): Promise<IntentEngineResult> {
  try {
    // 1. Ask Gemini to extract intent (non-deterministic)
    const extraction = await geminiExtractIntent(prompt);

    // 2. Map to our expected deterministic schema format
    const intentPayload = {
      purpose: extraction.purpose,
      maxBudget: extraction.maxBudget,
      maxQuantity: extraction.maxQuantity,
      allowedCategory: extraction.category !== 'General' ? extraction.category : undefined,
      deliveryReq: extraction.deliveryRequirement || undefined,
      originalPrompt: prompt,
    };

    // 3. Enforce structural integrity via Zod
    const validated = IntentLockSchema.parse(intentPayload);

    return {
      success: true,
      intent: validated,
      rawExtraction: extraction,
    };
  } catch (error) {
    console.error('[Intent Engine] Processing failed:', error);
    return {
      success: false,
      errors: error,
    };
  }
}
