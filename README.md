# 🛡️ Commerce Sentinel

> **The Real-Time Security & Authorization Layer for AI Buyer Agents and Autonomous Commerce.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![Turbopack](https://img.shields.io/badge/Turbopack-Ready-blueviolet?style=for-the-badge&logo=vercel)](https://turbo.build/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payment_Gateway-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)
[![Gemini](https://img.shields.io/badge/Gemini_2.0_Flash-LLM_Security-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-5.21.1-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?style=for-the-badge&logo=vercel)](https://commerce-sentinel.vercel.app)

---

## 🌐 Live Production Deployment

🔗 **[https://commerce-sentinel.vercel.app](https://commerce-sentinel.vercel.app)**

* **AI Buyer Agent:** [https://commerce-sentinel.vercel.app/buyer](https://commerce-sentinel.vercel.app/buyer)
* **Merchant Dashboard:** [https://commerce-sentinel.vercel.app/dashboard](https://commerce-sentinel.vercel.app/dashboard)
* **Attack Simulator:** [https://commerce-sentinel.vercel.app/dashboard/simulate](https://commerce-sentinel.vercel.app/dashboard/simulate)
* **Audit Trail:** [https://commerce-sentinel.vercel.app/dashboard/audit](https://commerce-sentinel.vercel.app/dashboard/audit)

---

## 💡 The Problem

As autonomous AI agents evolve from conversational assistants to empowered buyers with delegated financial authority, a dangerous security gap emerges:

1. **Prompt Injection & Hijacking:** Malicious seller metadata can inject instructions into the buyer agent's context window.
2. **Intent & Budget Drift:** Agents hallucinate or deviate from the user's spending limits and product constraints.
3. **Real-Time Price Volatility:** Flash price increases between item discovery and cart checkout drain user wallets.
4. **Inventory Race Conditions:** Competing autonomous agents attempting to claim the same stock cause ghost orders and stranded payments.
5. **Irreversible Financial Commitment:** Lack of cryptographic transaction locks and audit provenance before triggering payment gateway transactions.

---

## 🔒 The Solution: Commerce Sentinel

**Commerce Sentinel** sits directly between Autonomous AI Buyers and the **Razorpay Payment Gateway**, enforcing human intent, live price verification, merchant policy, and cryptographic auditability before any fund authorization occurs.

```
+---------------------+     +--------------------------+     +------------------------+
|  Autonomous Buyer   | --> |     COMMERCE SENTINEL    | --> |    Razorpay Gateway    |
|  AI Agent (LLM)     |     |    10-Stage Security     |     |   (Test & Live Auth)   |
+---------------------+     +--------------------------+     +------------------------+
                                        |
                 +----------------------+----------------------+
                 |                      |                      |
                 v                      v                      v
        [ Intent Lock Engine ]  [ Pre-Flight Verifier ]  [ SHA-256 Audit Trail ]
        (Budget, Item, SLA)     (Price, Stock, Tokens)   (Tamper-Evident Ledger)
```

---

## ⚡ The 10-Stage Sentinel Gate

Every transaction must deterministically pass 10 discrete gates:

| # | Gate | Description |
|---|---|---|
| 1 | **Agent Identity Verification** | Authenticates registered agent ID and trust score. |
| 2 | **Capability Token Check** | Validates scoped, time-bound permissions (restricting unauthorized fund transfers). |
| 3 | **Intent Lock Binding** | Cryptographically binds human intent (`maxBudget`, `category`, `deliverySLA`). |
| 4 | **Prompt Injection Isolation** | Sanitizes untrusted seller metadata before agent ingestion. |
| 5 | **Merchant Policy Engine** | Verifies catalog boundaries, coupon limits, and merchant-defined rules. |
| 6 | **Explainable Risk Scoring** | Multi-dimensional scoring evaluating anomaly probability (0.00 – 1.00). |
| 7 | **Live Price Integrity** | Real-time price match check; halts if price drifts by even ₹1. |
| 8 | **Atomic Stock Reservation** | Prevents agent inventory race conditions and ghost checkouts. |
| 9 | **Razorpay Pre-Auth Gate** | Secure order creation and client modal integration. |
| 10 | **Tamper-Evident Audit Chain** | HMAC-SHA256 signature verification and immutable ledger recording. |

---

## 🛠️ Tech Stack

* **Framework:** [Next.js 16.3.3](https://nextjs.org/) (App Router, Turbopack, Server Actions)
* **Language:** TypeScript 5 (Strict Mode)
* **Styling:** Tailwind CSS with custom Glassmorphism & Cyber-Arctic design system
* **Payment Gateway:** [Razorpay](https://razorpay.com/) (Checkout JS, Orders API, Webhook HMAC validation)
* **AI / LLM:** [Google Gemini 2.0 Flash](https://ai.google.dev/) for real-time intent extraction & injection defense
* **Database & ORM:** [Prisma ORM](https://www.prisma.io/) with PostgreSQL ([Supabase](https://supabase.com/))
* **Real-time Sync:** Server-Sent Events (SSE) + BroadcastChannel API
* **Icons & UI:** Lucide React, Kinetic Canvas Grids, Dynamic Glitch Headers

---

## 🚀 Getting Started

### Prerequisites

* Node.js 20+
* npm or pnpm
* Razorpay Account (Key ID & Key Secret)
* Google Gemini API Key
* PostgreSQL database (or Supabase)

### 1. Clone & Install

```bash
git clone https://github.com/Akashsenthilkumar08/commerce-sentinel.git
cd commerce-sentinel
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"
DIRECT_URL="postgresql://user:password@host:5432/dbname"

# Razorpay Credentials
RAZORPAY_KEY_ID="rzp_test_your_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Google Gemini API
GEMINI_API_KEY="your_gemini_api_key"

# Shopify Storefront (Optional / Catalog Integration)
SHOPIFY_STORE_DOMAIN="your-store.myshopify.com"
SHOPIFY_STOREFRONT_ACCESS_TOKEN="your_access_token"

# Upstash Redis / Real-Time SSE (Optional)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your_upstash_token"
```

### 3. Generate Prisma Client & Migrate

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🧪 Testing & Demo Simulation

1. **Visit [AI Buyer Terminal](/buyer):**
   * Submit an autonomous purchase prompt (e.g. `"Buy this headset for ₹2,999."`).
   * Observe **Gemini 2.0 Intent Analysis** decomposition and **Intent Lock #INT-92841** creation.
2. **Test Price Drift Defense:**
   * In the **Live Simulation Controls** panel, click **🔴 Set ₹3,499 (Drift)**.
   * Watch the Pre-Flight Gate turn **RED**, invalidate the transaction, and pause payment.
   * Click **🟢 Restore ₹2,999** to restore validation.
3. **Execute Razorpay Checkout:**
   * Click **Pay ₹2,999 via Razorpay Test Mode**.
   * Confirm payment in the modal → stock ticks down live, HMAC signature is validated, and the transaction is recorded to the **SHA-256 Audit Trail**.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
