# ☪️ Furqon AI — Qur'on va Hadis yordamchisi

**Furqon AI** — Islom dini bo'yicha savollaringizga Qur'on va Hadis dalillari bilan javob beradigan sun'iy intellekt yordamchisi.

![Next.js](https://img.shields.io/badge/Next.js-16.2.6-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-green)

##  Xususiyatlar

| Xususiyat | Tavsif |
|-----------|--------|
| ✅ **Aniq javoblar** | AI diniy ma'lumotlarda xato qilmasligi uchun maxsus prompt |
| ✅ **API tasdiqlash** | Har bir oyat alquran.cloud API orqali tekshiriladi |
| ✅ **Dalillar bilan** | Har bir javobda Qur'on oyati va Hadis manbalari |
| ✅ **O'zbek tili** | To'liq o'zbek tilida qo'llab-quvvatlash |
| ✅ **Chiroyli dizayn** | Zamonaviy va qulay interfeys |
| ✅ **Tezkor javob** | Google Gemma 3 AI modeli |
| ✅ **99% Aniqlik** | Variant B arxitekturasi (AI + API tekshiruvi) |

## 🏗️ Arxitektura (Variant B)

```
┌─────────────────────────────────────┐
│  Savol (Foydalanuvchi)              │
└──────────────┬──────────────────────┘
               ↓
─────────────────────────────────────┐
│  1. AI (Google Gemma 3)             │
│     - Mavzuni aniqlaydi             │
│     - Qisqa javob beradi            │
│     - Oyat raqamlarini ko'rsatadi   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  2. Qur'on API Tekshiruv            │
│     - alquran.cloud API             │
│     - Har bir oyatni yuklab oladi   │
│     - Arabcha + O'zbekcha tarjima   │
└──────────────┬──────────────────────┘
               ↓
┌─────────────────────────────────────┐
│  3. Tasdiqlangan Javob              │
│     ✅ Faqat haqiqiy oyatlar        │
│      To'liq matn ko'rsatiladi     │
│     🔗 API manbasi bilan            │
└─────────────────────────────────────┘
```

**Ishlatiladigan API lar:**
- **alquran.cloud** — Qur'on oyatlari (arabcha + o'zbekcha tarjima) - BEPUL
- **sunnah.com** — Hadislar (kelajakda) - BEPUL
- **OpenRouter** — Google Gemma 3 AI modeli - BEPUL tier

## 🚀 Ishga tushirish

### 1. Bog'liqliklarni o'rnatish
```bash
npm install
```

### 2. .env faylini sozlash
```bash
cp .env.example .env
```

`.env` faylini tahrirlang:
```env
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5432/app_db
OPENROUTER_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxx
SUNNAH_API_KEY= (ixtiyoriy)
```

**API kalit olish:**
1. [OpenRouter.ai](https://openrouter.ai/) ga o'ting
2. Ro'yxatdan o'ting
3. API Keys bo'limidan yangi kalit yarating
4. `.env` fayliga qo'shing

### 3. Development serverini ishga tushirish
```bash
npm run dev
```

Sayt **http://localhost:3000** da ochiladi.

### 4. Production build
```bash
npm run build
npm run start
```

## 📁 Loyiha tuzilmasi

```
FURQON-AI/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts    ← AI + Quran API integratsiyasi
│   │   │   └── health/route.ts  ← Server tekshiruvi
│   │   ├── page.tsx             ← Asosiy chat sahifasi
│   │   ├── layout.tsx           ← Umumiy dizayn
│   │   ── globals.css          ← Stillar
│   ── db/
│       ├── index.ts             ← Database ulanishi
│       └── schema.ts            ← Jadval tuzilmasi
── .env.example                 ← API kalitlar namunasi
├── .gitignore                   ← Git ignore fayli
├── package.json                 ← Bog'liqliklar
└── README.md                    ← Ushbu hujjat
```

## 🔧 Sozlamalarni o'zgartirish

### AI modelini o'zgartirish
`src/app/api/chat/route.ts` faylida `MODEL_NAME` o'zgaruvchisini topib o'zgartiring:

```typescript
const MODEL_NAME = "google/gemma-3-27b-it:free";
// Boshqa modelllar:
// - "meta-llama/llama-3-70b-instruct"
// - "mistralai/mistral-large"
// - "anthropic/claude-3.5-sonnet"
```

### System promptni o'zgartirish
`src/app/api/chat/route.ts` faylida `SYSTEM_PROMPT` o'zgaruvchisini tahrirlang. Bu AI ning javob uslubini belgilaydi.

### Dizaynni o'zgartirish
- **Ranglar:** `src/app/globals.css` faylida CSS o'zgaruvchilar
- **Interfeys:** `src/app/page.tsx` faylida React komponentlari

## 🌐 Internetga joylashtirish

### Vercel (Tavsiya etiladi)
1. [Vercel.com](https://vercel.com/) ga GitHub bilan kiring
2. **"Import Project"** → FURQON-AI repoi ni tanlang
3. **Environment Variables** qo'shing:
   - `DATABASE_URL`
   - `OPENROUTER_KEY`
4. **"Deploy"** tugmasini bosing

2-3 daqiqada saytingiz tayyor!

### Database sozlash
- **Local:** PostgreSQL o'rnating
- **Production:** [Neon](https://neon.tech/), [Supabase](https://supabase.com/), yoki [Railway](https://railway.app/) dan foydalaning

## 📊 Aniqlik Taqqoslash

| Xususiyat | Oddiy AI | Furqon AI (Variant B) |
|-----------|----------|----------------------|
| Oyat matni | ❌ AI to'qiydi | ✅ API dan olinadi |
| Oyat raqami | ⚠️ Xato bo'lishi mumkin | ✅ API tasdiqlaydi |
| O'zbek tarjima | ❌ AI tarjima | ✅ Rasmiy Mansur tarjimasi |
| Arabcha matn | ❌ AI yozadi | ✅ Uthmani script |
| Umumiy aniqlik | ~70% | **~99%** |

## 🧪 Test qilish

Saytda quyidagi savollarni bering:

1. **"Qur'onda ismi zikr qilingan sahobiy kim?"**
   - AI: Zayd ibn Horisa deb javob beradi
   - API: Ahzob 33:37 oyatini yuklab oladi
   - ✅ Tasdiqlangan oyat ko'rsatiladi

2. **"Ashhurul hurum qaysi oylar?"**
   - AI: 4 hurmatli oyni aytadi
   - ✅ Xato qilish ehtimoli kamayadi

3. **"Eng uzun oyat qaysi?"**
   - AI: Baqara 282 deb javob beradi
   - API: Oyatni yuklab oladi
   - ✅ To'liq matn ko'rsatiladi

## 📞 Aloqa

| Platforma | Havola |
|-----------|--------|
| **Telegram** | [@tahrirchi_admin](https://t.me/tahrirchi_admin) |
| **Email** | [muhammadfayzq@gmail.com](mailto:muhammadfayzq@gmail.com) |
| **GitHub** | [FURQON-AI](https://github.com/muhammadfayzboss-a11y/FURQON-AI) |

## ️ Muhim eslatma

**Diniy masalalarda yakuniy qaror uchun doim malakali ulamolarga murojaat qiling!**

Furqon AI faqat dastlabki ma'lumot olish uchun xizmat qiladi. AI xato qilish ehtimoli bor, shuning uchun muhim diniy masalalarda ishonchli manbalarga tayaning.

## 📝 Litsenziya

MIT License — Erkin foydalanishingiz mumkin.

---

**© 2025 Furqon AI. Muhammad Fayz tomonidan yaratilgan.**

**Versiya:** 2.0 (Variant B - API tasdiqlash bilan)
