# Vercel'da saytni doimiy ishga tushirish uchun yo'riqnoma

Assalomu alaykum! Saytingizni Vercel'da muvaffaqiyatli ishga tushirish uchun quyidagi qadamlarni bajaring:

### 1-qadam: Vercel'da yangi loyiha yaratish
1. [Vercel.com](https://vercel.com) saytiga kiring va GitHub profilingiz orqali tizimga kiring (Login with GitHub).
2. "Add New..." tugmasini bosib, "Project"ni tanlang.
3. Loyihalar ro'yxatidan `FURQON-AI` reponi topib, "Import" tugmasini bosing.

### 2-qadam: Ma'lumotlar bazasini (PostgreSQL) ulash
Chat tarixi va xabarlarni saqlash uchun ma'lumotlar bazasi kerak.
1. Vercel loyihangiz sahifasidan tepada turgan **"Storage"** bo'limiga o'ting.
2. **"Create Database"** tugmasini bosing va **"Postgres"** ni tanlang.
3. Ma'lumotlar bazasiga xohlagan nomni bering (masalan, `furqon-db`) va hudud (region) tanlab "Create" tugmasini bosing.
4. Yaratilgandan so'ng ekranda **"Connect"** oynasi chiqadi, loyihangizni tanlab ulash (Connect) tugmasini bosing. Bu loyihangizning Environment Variables ro'yxatiga avtomatik ravishda `DATABASE_URL` qo'shib qo'yadi.

### 3-qadam: OpenRouter API kalitini qo'shish (Environment Variables)
Men kodingizni siz bergan API token bilan ishlaydigan qilib sozladim. Endi bu tokenni Vercelga kiritamiz:
1. Loyiha sozlamalariga (Settings) o'ting.
2. Chapdagi menyudan **"Environment Variables"** bo'limini tanlang.
3. Key (kalit) maydoniga shuni yozing: `OPENROUTER_KEY`
4. Value (qiymat) maydoniga o'zingizning tokenni yozing: `[SIZNING_OPENROUTER_API_KALITINGIZ]`
5. "Save" (Saqlash) tugmasini bosing.

### 4-qadam: Bazani tayyorlash (Migration)
Sayt yuklanganida database-ga ulanishi uchun `drizzle-kit push` buyrug'ini "Build Command" ga qo'shish tavsiya qilinadi:
1. Loyihangizning Vercel-dagi sozlamalariga (Settings) o'ting.
2. **"General"** bo'limida **"Build & Development Settings"** dagi "Build Command" ni "Override" ni yoqib quyidagiga o'zgartiring:
   `npx drizzle-kit push && next build`
3. O'zgarishni saqlang.

Endi barcha qadamlar tayyor. Tepadan "Deployments" menyusiga o'ting va "Redeploy" qiling. Omadingizni bersin!

### Siz uchun nimalarni to'g'rilab berdim:
1. **Chat tarixi saqlanishi:** Barcha suhbatlar avtomatik ma'lumotlar bazasida (Vercel Postgres) saqlanadigan bo'ldi.
2. **Xatolar olib tashlandi:** Avvalgi koddagi AI yuborgan ma'lumotlarni o'qish xatolari to'g'rilandi.
3. **API so'rovlar:** GET va POST so'rovlari ajratilib, to'g'ri ishlaydigan qilib qo'yildi. Siz endi sahifani yangilasangiz ham suhbat tarixi yo'qolmaydi!
