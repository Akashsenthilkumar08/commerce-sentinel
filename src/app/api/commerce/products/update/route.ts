import { NextResponse } from 'next/server';
import { broadcastSentinelEvent } from '@/lib/events';
import { getProducts, getDemoProducts, isShopifyConfigured, NormalizedProduct } from '@/lib/shopify';

// ─── In-memory product state (seeded from real catalog on first GET) ───
type LiveProduct = {
  id: string;
  name: string;
  price: number; // in paise (₹100 = 10000)
  category: string;
  stock: number;
  delivery: string;
  status: string;
  image: string | null;
  shopifyId: string;
};

let liveProducts: LiveProduct[] = [];
let catalogSeeded = false;

async function seedCatalogIfNeeded() {
  if (catalogSeeded && liveProducts.length > 0) return;
  try {
    let raw: NormalizedProduct[];
    if (isShopifyConfigured()) {
      raw = await getProducts();
      // Fallback to demo if Shopify returns empty
      if (!raw || raw.length === 0) raw = getDemoProducts();
    } else {
      raw = getDemoProducts();
    }

    liveProducts = raw.map((p, i) => ({
      id: `prod_${i + 1}`,
      shopifyId: p.shopifyId,
      name: p.title,
      price: p.price, // already in paise
      category: p.category,
      stock: p.inventory,
      delivery: p.delivery,
      status: p.available ? (p.inventory <= 3 ? 'Low Stock' : 'Available') : 'Out of Stock',
      image: p.image,
    }));

    catalogSeeded = true;
  } catch (err) {
    console.error('[Products] Seed error:', err);
    // Graceful fallback to hardcoded demo
    if (liveProducts.length === 0) {
      liveProducts = [
        { id: 'prod_1', shopifyId: 'demo_1', name: 'Wireless Headphones', price: 299900, category: 'Audio', stock: 5, delivery: 'Tomorrow', status: 'Available', image: null },
        { id: 'prod_2', shopifyId: 'demo_2', name: 'Gaming Mouse', price: 189900, category: 'Accessories', stock: 45, delivery: '1-2 days', status: 'Available', image: null },
        { id: 'prod_3', shopifyId: 'demo_3', name: 'Mechanical Keyboard', price: 349900, category: 'Accessories', stock: 8, delivery: '1-2 days', status: 'Available', image: null },
        { id: 'prod_4', shopifyId: 'demo_4', name: 'Laptop Backpack', price: 179900, category: 'Bags', stock: 22, delivery: '2-3 days', status: 'Available', image: null },
        { id: 'prod_5', shopifyId: 'demo_5', name: 'USB-C Hub', price: 129900, category: 'Accessories', stock: 50, delivery: '1-2 days', status: 'Available', image: null },
      ];
      catalogSeeded = true;
    }
  }
}

export async function GET() {
  await seedCatalogIfNeeded();
  return NextResponse.json({ products: liveProducts });
}

export async function POST(req: Request) {
  await seedCatalogIfNeeded();
  try {
    const body = await req.json();
    const { productId = 'prod_1', price, stock } = body;

    const product = liveProducts.find((p) => p.id === productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const oldPrice = product.price;
    const oldStock = product.stock;

    if (price !== undefined) {
      product.price = Number(price);
    }
    if (stock !== undefined) {
      product.stock = Number(stock);
      product.status = product.stock <= 0 ? 'Out of Stock' : product.stock <= 3 ? 'Low Stock' : 'Available';
    }

    // Broadcast real-time events
    if (price !== undefined && oldPrice !== product.price) {
      broadcastSentinelEvent('PRICE_CHANGED', {
        productId: product.id,
        name: product.name,
        oldPrice,
        newPrice: product.price,
        timestamp: new Date().toISOString(),
      });
    }

    if (stock !== undefined && oldStock !== product.stock) {
      broadcastSentinelEvent('INVENTORY_CHANGED', {
        productId: product.id,
        name: product.name,
        oldStock,
        newStock: product.stock,
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      product,
      oldPrice,
      newPrice: product.price,
      oldStock,
      newStock: product.stock,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
