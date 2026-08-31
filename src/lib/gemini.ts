import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ExtractedIntent {
  purpose: string;
  maxBudget: number;
  maxQuantity: number;
  category: string;
  deliveryRequirement: string | null;
  keywords: string[];
  confidence: number;
}

export interface ProductRecommendation {
  productId: string;
  reason: string;
  score: number;
}

/**
 * Extract structured purchase intent from natural language using Gemini
 */
export async function extractIntent(userPrompt: string): Promise<ExtractedIntent> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = `You are an intent extraction engine for Commerce Sentinel, a security gateway for AI-initiated commerce.

Your ONLY job is to extract STRUCTURED PURCHASE INTENT from natural language.

You MUST respond with ONLY valid JSON, no markdown, no explanation.

RULES:
- Extract the user's ACTUAL intent, do not invent or modify it
- maxBudget must be in PAISE (multiply rupee amount by 100)
- If no budget specified, set maxBudget to 500000 (₹5,000)
- If no quantity specified, set maxQuantity to 1
- category must be a simple product category like "Audio", "Gift", "Electronics", etc.
- confidence is 0.0 to 1.0 based on how clear the intent is

JSON FORMAT:
{
  "purpose": "string describing purchase purpose",
  "maxBudget": number_in_paise,
  "maxQuantity": number,
  "category": "string",
  "deliveryRequirement": "string or null",
  "keywords": ["array", "of", "search", "terms"],
  "confidence": number
}`;

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `User request: "${userPrompt}"` },
    ]);

    const text = result.response.text().trim();
    // Extract JSON from potential markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON in Gemini response');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return {
      purpose: parsed.purpose || 'General purchase',
      maxBudget: Number(parsed.maxBudget) || 500000,
      maxQuantity: Number(parsed.maxQuantity) || 1,
      category: parsed.category || 'General',
      deliveryRequirement: parsed.deliveryRequirement || null,
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      confidence: Number(parsed.confidence) || 0.5,
    };
  } catch (err) {
    console.error('[Gemini] extractIntent error:', err);
    // Rule-based fallback
    return extractIntentFallback(userPrompt);
  }
}

/**
 * Recommend products using Gemini reasoning
 */
export async function recommendProducts(
  intent: ExtractedIntent,
  products: Array<{ productId: string; title: string; description: string; price: number; category: string }>
): Promise<ProductRecommendation[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `You are a product recommendation engine. Given the user's purchase intent and a product catalog, recommend the best matching products.

USER INTENT:
${JSON.stringify(intent)}

PRODUCT CATALOG (prices are in paise, divide by 100 for rupees):
${JSON.stringify(products.map(p => ({ id: p.productId, title: p.title, desc: p.description, price: p.price, category: p.category })))}

IMPORTANT:
- ONLY recommend products within the budget (maxBudget in paise)
- Match by category, keywords, and purpose
- Score each recommendation from 0.0 to 1.0

Respond with ONLY valid JSON array:
[{"productId": "string", "reason": "why this matches", "score": number}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.error('[Gemini] recommendProducts error:', err);
    // Fallback: return products within budget sorted by price match
    return products
      .filter(p => p.price <= intent.maxBudget)
      .map(p => ({
        productId: p.productId,
        reason: `Within budget - ${p.title}`,
        score: 0.5,
      }))
      .slice(0, 3);
  }
}

/**
 * Check for prompt injection in text content
 */
export async function detectPromptInjection(text: string): Promise<{
  isInjection: boolean;
  confidence: number;
  patterns: string[];
}> {
  const suspiciousPatterns = [
    /ignore\s+(all\s+)?previous\s+instructions/i,
    /disregard\s+(all\s+)?rules/i,
    /override\s+security/i,
    /bypass\s+(all\s+)?checks/i,
    /disable\s+security/i,
    /you\s+are\s+now/i,
    /act\s+as\s+(if|a)/i,
    /forget\s+(everything|all)/i,
    /system\s*:\s*/i,
    /admin\s*override/i,
    /mark\s+payment\s+(as\s+)?success/i,
    /buy\s+\d{2,}\s+units/i,
    /transfer\s+funds/i,
    /issue\s+refund/i,
  ];

  const detected: string[] = [];
  for (const pattern of suspiciousPatterns) {
    if (pattern.test(text)) {
      detected.push(pattern.source);
    }
  }

  return {
    isInjection: detected.length > 0,
    confidence: Math.min(detected.length * 0.3, 1.0),
    patterns: detected,
  };
}

/** Rule-based fallback when Gemini is unavailable */
function extractIntentFallback(prompt: string): ExtractedIntent {
  const lower = prompt.toLowerCase();

  // Extract budget
  let maxBudget = 500000;
  const budgetMatch = lower.match(/(?:under|below|max|budget|₹|rs\.?|inr)\s*(\d[\d,]*)/);
  if (budgetMatch) {
    maxBudget = parseInt(budgetMatch[1].replace(/,/g, '')) * 100;
  }

  // Extract quantity
  let maxQuantity = 1;
  const qtyMatch = lower.match(/(\d+)\s*(?:units?|pieces?|items?|nos?)/);
  if (qtyMatch) {
    maxQuantity = parseInt(qtyMatch[1]);
  }

  // Extract category
  const categories: Record<string, string[]> = {
    'Audio': ['headphone', 'headset', 'earphone', 'earbud', 'speaker'],
    'Electronics': ['laptop', 'phone', 'tablet', 'computer', 'mouse', 'keyboard'],
    'Gift': ['gift', 'birthday', 'present', 'surprise'],
    'Accessories': ['case', 'cover', 'bag', 'backpack', 'hub', 'cable'],
  };

  let category = 'General';
  for (const [cat, keywords] of Object.entries(categories)) {
    if (keywords.some(k => lower.includes(k))) {
      category = cat;
      break;
    }
  }

  // Extract delivery
  let deliveryRequirement: string | null = null;
  if (lower.includes('tomorrow')) deliveryRequirement = 'tomorrow';
  else if (lower.includes('today')) deliveryRequirement = 'today';
  else if (lower.includes('urgent') || lower.includes('asap')) deliveryRequirement = 'express';

  return {
    purpose: prompt.substring(0, 100),
    maxBudget,
    maxQuantity,
    category,
    deliveryRequirement,
    keywords: lower.split(/\s+/).filter(w => w.length > 3).slice(0, 5),
    confidence: 0.6,
  };
}

export function isGeminiConfigured(): boolean {
  return !!process.env.GEMINI_API_KEY;
}
