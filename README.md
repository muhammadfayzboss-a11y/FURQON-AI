# ☪ Furqon AI — Qurʼon va Hadis Yordamchisi

Sunʼiy intellekt yordamida Qurʼon oyatlari va sahih hadislardan javob olish platformasi.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-blue?logo=tailwindcss)

## 🚀 Xususiyatlari

- **Qurʼon oyatlari** — Har bir javob Qurʼon oyatlari bilan asoslanadi
- **Sahih hadislar** — Faqat ishonchli hadis kitoblaridan dalillar
- **Oyat tasdiqlash** — alquran.cloud API orqali oyatlar tekshiriladi
- **Suhbat tarixi** — PostgreSQL bazasida saqlanadi
- **Chiroyli dizayn** — Islomiy uslubda zamonaviy interfeys

## 📁 Loyiha tuzilishi

```
FURQON-AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/
│   │   │   │   └── route.ts      # Chat API (OpenRouter + Quran API)
│   │   │   └── health/
│   │   │       └── route.ts      # Health check
│   │   ├── globals.css           # Global stillar
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Asosiy sahifa (Chat UI)
│   └── db/
│       ├── index.ts              # Database ulanishi
│       └── schema.ts             # Drizzle ORM schema
├── .env.example                  # Namuna environment o'zgaruvchilari
├── .gitignore
├── drizzle.config.json
├── next.config.ts
├── package.json
├── postcss.config.mjs
├── tsconfig.json
└── README.md
```

## 🛠 O'rnatish (Lokal)

```bash
# 1. Reponi klonlash
git clone https://github.com/muhammadfayzboss-a11y/FURQON-AI.git
cd FURQON-AI

# 2. Paketlarni o'rnatish
npm install

# 3. .env faylini sozlash
cp .env.example .env
# .env faylini tahrirlang va kalit qo'shing

# 4. Bazani yaratish
npx drizzle-kit push

# 5. Ishga tushurish
npm run dev
```

## 🌐 Vercel-ga Deploy Qilish

### 1-qadam: Vercel-da import qilish
1. [vercel.com](https://vercel.com) ga kiring
2. "Add New Project" ni bosing
3. GitHub repongizni tanlang: `FURQON-AI`
4. Framework: **Next.js** tanlanadi avtomatik

### 2-qadam: Environment Variables
Vercel project settings → Environment Variables ga qo'shing:

| Nomi | Qiymati |
|------|---------|
| `OPENROUTER_KEY` | `sk-or-v1-...` (OpenRouter API kalitingiz) |
| `DATABASE_URL` | PostgreSQL URL (Vercel Postgres yoki boshqa) |

### 3-qadam: Database
- Vercel Dashboard → Storage → Create Database → Postgres
- Yoki [Neon](https://neon.tech), [Supabase](https://supabase.com) ishlatishingiz mumkin
- `DATABASE_URL` ni sozlang

### 4-qadam: Deploy
- "Deploy" tugmasini bosing
- Har bir git push avtomatik qayta deploy qiladi

## 🔑 API Kalitlari

### OpenRouter (AI uchun)
1. [openrouter.ai](https://openrouter.ai) dan ro'yxatdan o'ting
2. API key oling
3. `OPENROUTER_KEY` ga yozing

## 👨‍💻 Muallif

**Muhammad Fayz**
- Telegram: [@tahrirchi_admin](https://t.me/tahrirchi_admin)
- Email: muhammadfayzq@gmail.com

## 📄 Litsenziya

© 2026 Furqon AI. Barcha huquqlar himoyalangan.
