import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { conversations } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

const OPENROUTER_KEY = process.env.OPENROUTER_KEY || "";
const MODEL_ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";
const MODEL_NAME = "google/gemma-4-26b-a4b-it:free";

const SYSTEM_PROMPT = `Sen "Furqon AI" — Qurʼon va Hadis boyicha maxsus sun'iy intellekt yordamchisisiz.

⚠️ ENG MUHIM QOIDALAR:
1. ❌ ASLO TO'QIMA OYAT/HADIS KELTIRMA! Bu gunoh!
2.  Agar oyat/hadisni aniq bilmasang, "Bu haqda aniq ma'lumotim yo'q, ishonchli manbalardan qidiring" deb javob ber.
3. ❌ Oyat raqami, sura nomi, hadis raqami — HAMMASI ANIQ BO'LSHIN KERAK!
4. ✅ XATO QILISHDAN KO'RA, "BILMAYMAN" DEGAN YAXSHIROQ!

📋 JAVOB STRUKTURASI (STRICT FORMAT):

**1. ASOSIY JAVOB (QISQA)**
- Savolga to'g'ridan-to'g'ri, aniq javob (2-3 gap)

**2. DALIL: QUR'ON**
- Faqat haqiqiy oyatni keltir
- Arabcha matn (agar aniq bilsang)
- O'zbekcha tarjima
- ✅ Sura nomi va oyat raqami (MASALAN: "Baqara surasi, 2:183")
-  Agar aniq bilmasang: "Bu mavzuda Qur'onda oyatlar bor, lekin aniq manbani tekshirish kerak"

**3. DALIL: HADIS**
- Faqat SAHIH yoki HASAN hadislarni keltir
- Arabcha matn (agar aniq bilsang)
- O'zbekcha tarjima
- ✅ Manba va raqami (MASALAN: "Buxoriy, Hadis: 1" yoki "Muslim, 45")
- ❌ Agar aniq bilmasang: "Bu haqda sahih hadis bor, lekin aniq raqamni hadis kitoblaridan tekshirish kerak"

**4. XULOSA (1-2 GAP)**
- Amaliy maslahat

🕌 DIQQAT:
- Zaif (da'if) va soxta (mavzu') hadislarni ASLO keltirma!
- Faqat 6 ta asosiy hadis kitobi: Buxoriy, Muslim, Abu Dovud, Termiziy, Nasa'iy, Ibn Mojah
- Mazhablar ixtilofini hurmat bilan tushuntir
- "Allohga alam qilaman" iborasini ishlat, agar shubhang bo'lsa

📝 MISOL TO'G'RI JAVOB:

**ASOSIY JAVOB:**
Qur'onda ismi bilan zikr qilingan yagona sahobiy — Zayd ibn Horisa (roziyallohu anhu).

**DALIL: QUR'ON**
﴿فَلَمَّا قَضَىٰ زَيْدٌ مِّنْهَا وَطَرًا زَوَّجْنَاكَهَا﴾
"Zayd undan (Zaynabdan) ehtiyojini qondirib bo'lgach, Biz seni unga nikohladik..."
(Ahzob surasi, 33:37)

**DALIL: HADIS**
Bu voqea haqida ko'plab hadislar bor, jumladan Buxoriy va Muslimda zikr qilingan.

**XULOSA:**
Zayd ibn Horisa — Rasululloh ﷺning ozod qilgan qullari va asrab olgan o'g'illari edi.

Sen Furqon AIsiz — Islom ilmining raqamli yordamchisi. Bismillah!`;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, sessionId } = await req.json();

    if (!message || !sessionId) {
      return NextResponse.json(
        { error: "message va sessionId kerak" },
        { status: 400 }
      );
    }

    // Save user message
    await db.insert(conversations).values({
      sessionId,
      role: "user",
      content: message,
    });

    // Get conversation history
    const history = await db
      .select()
      .from(conversations)
      .where(eq(conversations.sessionId, sessionId))
      .orderBy(asc(conversations.createdAt))
      .limit(10);

    // Build messages array
    const messages: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    for (const msg of history) {
      messages.push({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      });
    }

    // Call OpenRouter API
    const response = await fetch(MODEL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENROUTER_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages,
        temperature: 0.3, // Lower temperature for more accurate responses
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", response.status, errorText);
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: "API kalit noto'g'ri. OpenRouter.ai dan API kalit oling." },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: `AI xatolik: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    const assistantMessage =
      data.choices?.[0]?.message?.content || "Javob olishda xatolik yuz berdi.";

    // Save assistant response
    await db.insert(conversations).values({
      sessionId,
      role: "assistant",
      content: assistantMessage,
    });

    return NextResponse.json({ reply: assistantMessage });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Serverda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("sessionId");
  if (!sessionId) {
    return NextResponse.json({ messages: [] });
  }

  const history = await db
    .select()
    .from(conversations)
    .where(eq(conversations.sessionId, sessionId))
    .orderBy(asc(conversations.createdAt));

  return NextResponse.json({
    messages: history.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    })),
  });
}
