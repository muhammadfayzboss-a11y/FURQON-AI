import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/db";
import { chatMessages } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

function getClient() {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: process.env.OPENROUTER_KEY ?? "sk-placeholder",
  });
}

const SYSTEM_PROMPT = `Sen Furqon AI - islomiy bilimlar yordamchisisan. Sen faqat o'zbek tilida javob berasan. Sening vazifang:
- Qur'on oyatlari va hadislar asosida savollarga javob berish
- Islomiy masalalarda maslahat berish  
- Namoz, ro'za, zakot va boshqa ibodat masalalarida yordam berish
- Islom tarixi haqida ma'lumot berish
- Har doim hurmat bilan va ilmiy asosda javob berish
- Javoblaringda Qur'on oyatlari va sahih hadislardan dalil keltirish
- Agar biror narsani bilmasang, "Alloh biladi" deb aytish

Muhim: Har doim o'zbek tilida javob ber. Javoblarni tushunarli va sodda tilda yoz.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message, sessionId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Xabar bo'sh" }, { status: 400 });
    }

    const sid = sessionId || crypto.randomUUID().slice(0, 16);

    // Save user message
    await db.insert(chatMessages).values({
      role: "user",
      content: message,
      sessionId: sid,
    });

    // Get chat history for context
    const history = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sid))
      .orderBy(asc(chatMessages.createdAt))
      .limit(20);

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...history.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    const client = getClient();
    const completion = await client.chat.completions.create({
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const reply = completion.choices?.[0]?.message?.content || "Kechirasiz, javob ololmadim.";

    // Save assistant reply
    await db.insert(chatMessages).values({
      role: "assistant",
      content: reply,
      sessionId: sid,
    });

    return NextResponse.json({ reply, sessionId: sid });
  } catch (error: unknown) {
    console.error("Chat API error:", error);
    const errMsg = error instanceof Error ? error.message : "Noma'lum xato";
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
