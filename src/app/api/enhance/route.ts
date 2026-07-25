import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert resume writer. The user will provide a rough description of their work experience. Your job is to rewrite it into professional, impactful, and action-oriented resume bullet points. Ensure the output uses strong action verbs, quantifies achievements where possible, and removes unnecessary fluff. Return ONLY the rewritten bullet points, formatted with bullet characters (•), without any introductory or concluding text."
        },
        {
          role: "user",
          content: text
        }
      ],
      temperature: 0.7,
    });

    const enhancedText = response.choices[0].message.content;

    return NextResponse.json({ enhancedText });
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    return NextResponse.json(
      { error: 'Failed to enhance text' },
      { status: 500 }
    );
  }
}
