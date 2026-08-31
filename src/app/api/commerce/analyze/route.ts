import { NextResponse } from 'next/server';
import { extractIntent, recommendProducts, detectPromptInjection } from '@/lib/gemini';
import { getProducts } from '@/lib/shopify';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // 1. Fetch live Shopify products
    const catalog = await getProducts();
    if (!catalog || catalog.length === 0) {
      return NextResponse.json({ error: 'Catalog is empty or unreachable' }, { status: 500 });
    }

    // 2. Extract structured intent via Gemini
    const intent = await extractIntent(prompt);

    // 3. Optional: Quick injection check (the true security check is at Preflight, but this helps UX)
    const security = await detectPromptInjection(prompt);
    if (security.isInjection) {
      return NextResponse.json({
        error: 'Security violation detected',
        reason: 'Prompt injection detected in request',
        security
      }, { status: 403 });
    }

    // 4. Recommend products based on intent and live catalog
    const recommendations = await recommendProducts(intent, catalog);

    // Map recommendations to full product objects
    const recommendedProducts = recommendations.map(rec => {
      const product = catalog.find(p => p.productId === rec.productId);
      return {
        ...product,
        matchScore: rec.score,
        matchReason: rec.reason
      };
    }).filter(p => p.productId !== undefined);

    return NextResponse.json({
      intent,
      recommendations: recommendedProducts,
      catalogSize: catalog.length
    });

  } catch (error) {
    console.error('[Analyze API] Error:', error);
    return NextResponse.json({ error: 'Failed to analyze prompt' }, { status: 500 });
  }
}
