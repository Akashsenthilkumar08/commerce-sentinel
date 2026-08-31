import { NextResponse } from 'next/server';
import { getProducts, getDemoProducts, isShopifyConfigured } from '@/lib/shopify';

export async function GET() {
  try {
    let products = [];
    
    if (isShopifyConfigured()) {
      products = await getProducts();
    } else {
      products = getDemoProducts();
    }
    
    return NextResponse.json({
      source: isShopifyConfigured() ? 'shopify' : 'demo',
      count: products.length,
      products
    });
  } catch (error) {
    console.error('[Catalog API] Error:', error);
    // Fallback to demo data if Shopify fails
    return NextResponse.json({
      source: 'demo_fallback',
      count: getDemoProducts().length,
      products: getDemoProducts(),
      error: 'Failed to fetch from Shopify'
    });
  }
}
