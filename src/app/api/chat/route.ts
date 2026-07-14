import { NextRequest, NextResponse } from "next/server";

const MODEL_NAME = "google/gemma-3-27b-it:free";

const SYSTEM_PROMPT = `Siz — Furqon AI, Islom dini bo'yicha mutaxassis AI yordamchisisiz.

MUHIM QOIDALAR:
1. Faqat SAHIH (isbotlangan) ma'lumotlarni bering
2. Agar aniq bilmasangiz, "Bu haqida aniq ma'lumotim yo'q" deb ayting
3. Hech qachon oyat yoki hadisni to'qimang
4. Har bir dalilni aniq manba bilan keltiring (sura:oyat, hadis kitobi:raqam)
5. O'zbek tilida javob bering

JAVOB FORMATI:
1. Birinchi navbatda QISQA VA ANIQ javob bering
2. Keyin DALIL keltiring:
   - Qur'on oyati (sura nomi, raqam, o'zbekcha tarjima)
   - Hadis (kitob nomi, raqam, matn)
3. Kerak bo'lsa QO'SHIMCHA IZOH bering

XATO QILMASLIK UCHUN:
- Sahobalar ismlarini aniq yozing
- Sura va oyat raqamlarini tekshiring
- Hadis raqamlarini taxmin qilmang
- 4 hurmatli oy: Zulqa'da, Zulhijja, Muharram, Rajab (Shavvol emas!)
- Qur'onda ismi bilan zikr qilingan yagona sahobiy: Zayd ibn Horisa (Ahzob 33:37)

AGAR SAVOL NOANIQ BO'LSA:
- Savolni aniqroq qilishni so'rang
- Taxmin qilib javob bermang`;

async function fetchQuranVerse(sura: number, ayat: number): Promise<{
  arabic: string;
  uzbek: string;
  found: boolean;
} | null> {
  try {
    const response = await fetch(
      `https://api.alquran.cloud/v1/ayah/${sura}:${ayat}/editions/quran-uthmani,uz.mansur`
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    if (data.code !== 200 || !data.data || data.data.length < 2) return null;
    
    return {
      arabic: data.data[0]?.text || "",
      uzbek: data.data[1]?.text || "",
      found: true,
    };
  } catch (error) {
    console.error("Quran API error:", error);
    return null;
  }
}

function extractQuranReferences(text: string): Array<{ sura: number; ayat: number }> {
  const references: Array<{ sura: number; ayat: number }> = [];
  const pattern = /(\d+):(\d+)/g;
  
  const matches = [...text.matchAll(pattern)];
  for (const match of matches) {
    const sura = parseInt(match[1]);
    const ayat = parseInt(match[2]);
    if (sura >= 1 && sura <= 114 && ayat >= 1) {
      references.push({ sura, ayat });
    }
  }
  
  const unique = references.filter((ref, index, self) =>
    index === self.findIndex(r => r.sura === ref.sura && r.ayat === ref.ayat)
  );
  
  return unique.slice(0, 5);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Xabar matni talab qilinadi" },
        { status: 400 }
      );
    }

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "HTTP-Referer": "https://furqon-ai.vercel.app",
        "X-Title": "Furqon AI",
      },
      body: JSON.stringify({
        model: MODEL_NAME,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.text();
      console.error("OpenRouter error:", errorData);
      
      if (aiResponse.status === 401) {
        return NextResponse.json(
          { error: "API kalit noto'g'ri" },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: "AI xizmati bilan bog'lanishda xatolik" },
        { status: aiResponse.status }
      );
    }

    const aiData = await aiResponse.json();
    const aiText = aiData.choices?.[0]?.message?.content || "Javob topilmadi";

    const quranRefs = extractQuranReferences(aiText);
    const verifiedVerses: Array<{
      sura: number;
      ayat: number;
      arabic: string;
      uzbek: string;
      verified: boolean;
    }> = [];

    for (const ref of quranRefs) {
      const verse = await fetchQuranVerse(ref.sura, ref.ayat);
      verifiedVerses.push({
        sura: ref.sura,
        ayat: ref.ayat,
        arabic: verse?.arabic || "",
        uzbek: verse?.uzbek || "",
        verified: !!verse?.found,
      });
    }

    let finalResponse = aiText;
    
    const verifiedCount = verifiedVerses.filter(v => v.verified).length;
    if (verifiedCount > 0) {
      finalResponse += "\n\n📖 **TASDIQLANGAN OYATLAR**:\n";
      for (const verse of verifiedVerses) {
        if (verse.verified) {
          finalResponse += `\n▫️ **${verse.sura}:${verse.ayat}**\n`;
          finalResponse += `🕌 Arabcha: ${verse.arabic}\n`;
          finalResponse += `📚 O'zbekcha: ${verse.uzbek}\n`;
        }
      }
      finalResponse += "\n✅ Barcha oyatlar alquran.cloud API orqali tasdiqlandi.";
    }

    return NextResponse.json({ 
      response: finalResponse,
      model: MODEL_NAME,
      verifiedVerses: verifiedVerses,
      hasVerifiedData: verifiedCount > 0,
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Server xatoligi: " + (error as Error).message },
      { status: 500 }
    );
  }
}
