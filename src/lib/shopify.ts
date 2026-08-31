// Shopify Admin REST API service
// Fetches real product data from connected Shopify store

interface ShopifyProduct {
  id: number;
  title: string;
  body_html: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  status: string;
  tags: string;
  variants: ShopifyVariant[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

interface ShopifyVariant {
  id: number;
  product_id: number;
  title: string;
  price: string;
  compare_at_price: string | null;
  sku: string;
  inventory_quantity: number;
  inventory_item_id: number;
}

interface ShopifyImage {
  id: number;
  src: string;
  alt: string | null;
}

export interface NormalizedProduct {
  productId: string;
  shopifyId: string;
  shopifyVariantId: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  currency: string;
  available: boolean;
  inventory: number;
  category: string;
  image: string | null;
  delivery: string;
  updatedAt: string;
}

function getShopifyConfig() {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_ACCESS_TOKEN;
  if (!domain || !token) {
    return null;
  }
  return { domain, token };
}

async function shopifyFetch<T>(endpoint: string): Promise<T> {
  const config = getShopifyConfig();
  if (!config) throw new Error('Shopify not configured');

  const url = `https://${config.domain}/admin/api/2024-01/${endpoint}`;
  const res = await fetch(url, {
    headers: {
      'X-Shopify-Access-Token': config.token,
      'Content-Type': 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Shopify API ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

function normalizeProduct(p: ShopifyProduct): NormalizedProduct {
  const variant = p.variants[0];
  const priceInPaise = Math.round(parseFloat(variant?.price || '0') * 100);
  const compareAtPaise = variant?.compare_at_price
    ? Math.round(parseFloat(variant.compare_at_price) * 100)
    : null;

  // Strip HTML tags from description
  const desc = (p.body_html || '').replace(/<[^>]*>/g, '').trim();

  return {
    productId: `shopify_${p.id}`,
    shopifyId: String(p.id),
    shopifyVariantId: String(variant?.id || ''),
    title: p.title,
    description: desc,
    price: priceInPaise, // Store in paise for Razorpay
    compareAtPrice: compareAtPaise,
    currency: 'INR',
    available: p.status === 'active' && (variant?.inventory_quantity ?? 0) > 0,
    inventory: variant?.inventory_quantity ?? 0,
    category: p.product_type || 'General',
    image: p.image?.src || (p.images?.[0]?.src ?? null),
    delivery: '1-2 business days',
    updatedAt: p.updated_at,
  };
}

export async function getProducts(): Promise<NormalizedProduct[]> {
  try {
    const data = await shopifyFetch<{ products: ShopifyProduct[] }>('products.json?limit=50&status=active');
    return data.products.map(normalizeProduct);
  } catch (err) {
    console.error('[Shopify] getProducts error:', err);
    return [];
  }
}

export async function getProductById(shopifyId: string): Promise<NormalizedProduct | null> {
  try {
    const data = await shopifyFetch<{ product: ShopifyProduct }>(`products/${shopifyId}.json`);
    return normalizeProduct(data.product);
  } catch (err) {
    console.error('[Shopify] getProductById error:', err);
    return null;
  }
}

export async function getProductPrice(shopifyId: string): Promise<number | null> {
  try {
    const product = await getProductById(shopifyId);
    return product?.price ?? null;
  } catch {
    return null;
  }
}

export async function getInventory(shopifyId: string): Promise<number | null> {
  try {
    const product = await getProductById(shopifyId);
    return product?.inventory ?? null;
  } catch {
    return null;
  }
}

export async function getProductSnapshot(shopifyId: string): Promise<{
  price: number;
  inventory: number;
  available: boolean;
  title: string;
} | null> {
  const product = await getProductById(shopifyId);
  if (!product) return null;
  return {
    price: product.price,
    inventory: product.inventory,
    available: product.available,
    title: product.title,
  };
}

export function isShopifyConfigured(): boolean {
  return !!getShopifyConfig();
}

// Demo fallback products when Shopify is offline
export function getDemoProducts(): NormalizedProduct[] {
  return [
    {
      productId: 'demo_1', shopifyId: 'demo_1', shopifyVariantId: 'v_demo_1',
      title: 'Wireless Headphones', description: 'Premium wireless bluetooth headphones with ANC',
      price: 299900, compareAtPrice: 399900, currency: 'INR', available: true,
      inventory: 5, category: 'Audio', image: null, delivery: 'Tomorrow', updatedAt: new Date().toISOString(),
    },
    {
      productId: 'demo_2', shopifyId: 'demo_2', shopifyVariantId: 'v_demo_2',
      title: 'Gaming Mouse', description: 'High-precision gaming mouse 16000 DPI',
      price: 189900, compareAtPrice: null, currency: 'INR', available: true,
      inventory: 45, category: 'Accessories', image: null, delivery: '1-2 days', updatedAt: new Date().toISOString(),
    },
    {
      productId: 'demo_3', shopifyId: 'demo_3', shopifyVariantId: 'v_demo_3',
      title: 'Mechanical Keyboard', description: 'Cherry MX Blue switches, RGB backlit',
      price: 349900, compareAtPrice: 449900, currency: 'INR', available: true,
      inventory: 8, category: 'Accessories', image: null, delivery: '1-2 days', updatedAt: new Date().toISOString(),
    },
    {
      productId: 'demo_4', shopifyId: 'demo_4', shopifyVariantId: 'v_demo_4',
      title: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI and PD charging',
      price: 129900, compareAtPrice: null, currency: 'INR', available: true,
      inventory: 50, category: 'Accessories', image: null, delivery: '1-2 days', updatedAt: new Date().toISOString(),
    },
    {
      productId: 'demo_5', shopifyId: 'demo_5', shopifyVariantId: 'v_demo_5',
      title: 'Laptop Backpack', description: 'Water-resistant laptop backpack with USB port',
      price: 179900, compareAtPrice: 249900, currency: 'INR', available: true,
      inventory: 22, category: 'Bags', image: null, delivery: '2-3 days', updatedAt: new Date().toISOString(),
    },
  ];
}
