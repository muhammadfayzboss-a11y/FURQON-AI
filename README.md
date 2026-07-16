# 🕌 Furqon AI

**Furqon AI** — Qur'on va Hadis asosida savollarga javob beruvchi sun'iy intellekt yordamchisi.

## ✨ Xususiyatlar

- 🤖 OpenRouter AI (DeepSeek) orqali ishlaydi
- 📖 Qur'on va Hadis asosida javob beradi
- 🇺🇿 Faqat o'zbek tilida
- 💾 Chat tarixi PostgreSQL da saqlanadi
- 🎨 Chiroyli islomiy dizayn

## 🚀 Vercel'da Deploy Qilish

### 1-qadam: Vercel'ga import qilish
1. [vercel.com](https://vercel.com) ga kiring
2. "Add New Project" bosing
3. GitHub'dan FURQON-AI reponi import qiling

### 2-qadam: Database yaratish
1. Vercel Dashboard → **Storage** → **Create Database**
2. **Neon Postgres** tanlang (bepul)
3. Database nomini kiriting va yarating
4. DATABASE_URL avtomatik qo'shiladi

### 3-qadam: Environment Variables
"Settings" → "Environment Variables" bo'limiga qo'shing:

| Nomi | Qiymati |
|------|---------|
| `OPENROUTER_KEY` | OpenRouter API kalitingiz |

> DATABASE_URL Neon yaratilganda avtomatik qo'shiladi

### 4-qadam: Deploy
"Deploy" bosing va kuting!

### 5-qadam: Database schema
Deploy tugagandan keyin, terminalda:
```bash
npx drizzle-kit push
```

Yoki Neon Console'da SQL:
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  role VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  session_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);
```

## 🔑 API Kalitlari

### OpenRouter
1. [openrouter.ai](https://openrouter.ai) ga ro'yxatdan o'ting
2. API Keys → Create Key
3. Kalitni `OPENROUTER_KEY` ga qo'shing

## 🛠️ Lokal ishga tushirish

```bash
# Klonlash
git clone https://github.com/muhammadfayzboss-a11y/FURQON-AI.git
cd FURQON-AI

# Paketlar o'rnatish
npm install

# .env yaratish
cp .env.example .env
# .env faylini to'ldiring

# Database schema push
npx drizzle-kit push

# Ishga tushirish
npm run dev
```

## 📁 Loyiha Strukturasi

```
FURQON-AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts    ← AI chat API
│   │   │   └── health/route.ts  ← Health check
│   │   ├── globals.css          ← Stillar
│   │   ├── layout.tsx           ← Root layout
│   │   └── page.tsx             ← Chat interfeysi
│   └── db/
│       ├── index.ts             ← DB ulanish
│       └── schema.ts            ← Jadval sxemasi
├── .env.example
├── package.json
└── README.md
```

## ⚠️ Eslatma

Furqon AI sun'iy intellekt bo'lib, xato qilishi mumkin. Muhim diniy masalalarda doim malakali ulamolarga murojaat qiling.

---

**Bismillahir Rohmanir Rohiym** 🤲
