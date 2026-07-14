# Furqon AI — Qurʼon va Hadis Yordamchisi

Sunʼiy intellekt yordamida Qurʼon oyatlari va sahih hadislardan javob olish platformasi.

## 🚀 Ishga tushirish

### 1. OpenRouter API Kalit olish (BEPUL)

1. **[OpenRouter.ai](https://openrouter.ai/)** ga oting
2. Ro'yxatdan o'ting (email yoki Google bilan)
3. **API Keys** bo'limiga oting
4. **"Create Key"** tugmasini bosing
5. Kalit nomini yozing (masalan: `Furqon AI`)
6. API kalitni nusxalang
7. **.env** fayliga qo'ying:

```env
OPENROUTER_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxx
```

### 2. Loyihani ishga tushirish

```bash
# Bogʻliqliklarni ornatish
npm install

# Maʼlumotlar bazasini sozlash
npx drizzle-kit push

# Development serverini ishga tushirish
npm run dev
```

### 3. Brauzerda ochish

`http://localhost:3000` ga oting va savol bering!

## 📁 Fayl tuzilmasi

```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts    # AI chat API (OpenRouter)
│   │   └── health/route.ts  # Health check
│   ├── globals.css          # Global styles (Islamic theme)
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Chat interface
├── db/
    ├── index.ts             # Database connection
    ── schema.ts            # Database schema
```

## 🔧 Texnologiyalar

- **Next.js 16** (App Router)
- **PostgreSQL** + Drizzle ORM
- **OpenRouter API** (Llama 3.2 - bepul)
- **Tailwind CSS** (Islamic design)
- **TypeScript**

##  Foydalanish

1. Brauzerda `http://localhost:3000` ni oching
2. Savolni yozing (masalan: "Namoz haqida oyat va hadis")
3. AI Qurʼon oyatlari va hadislarni keltirib javob beradi

### Namuna savollar:
- "Namoz o'qishning fazilati haqida oyat va hadis keltiring"
- "Sabr qilish haqida Qurʼonda nima deyilgan?"
- "Ota-onaga hurmat haqida hadislar"
- "Sadaqa berishning savoblari haqida"

## ️ Muhim eslatma

Furqon AI faqat maʼlumot beradi. Har doim ishonchli olimlardan maslahat oling!

## 📊 API Limitlar

OpenRouter bepul tier:
- Llama 3.2 3B Instruct: Bepul
- Rate limit: ~50-200 so'rov/kun
- Tezlik: O'rtacha
