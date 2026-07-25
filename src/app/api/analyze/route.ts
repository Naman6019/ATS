import { NextResponse } from 'next/server';
import { PDFParse } from 'pdf-parse';
import OpenAI from 'openai';

// Ensure the route is evaluated dynamically since we are handling FormData
export const dynamic = 'force-dynamic';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const jobDescription = formData.get('jobDescription') as string;

    if (!file || !jobDescription) {
      return NextResponse.json({ error: 'Missing file or job description' }, { status: 400 });
    }

    // Extract text from PDF
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const parser = new PDFParse({ data: buffer });
    const textResult = await parser.getText();
    const resumeText = textResult.text;

    // Call OpenAI
    const prompt = `
      You are an expert ATS (Applicant Tracking System) and career coach.
      Analyze the following resume against the provided job description.
      
      Job Description:
      ${jobDescription}
      
      Resume:
      ${resumeText}
      
      Provide a JSON response with the following structure exactly:
      {
        "score": (a number from 0 to 100 representing the match percentage),
        "summary": (a short paragraph summarizing the match),
        "missingKeywords": (an array of strings of important keywords from the JD missing in the resume),
        "suggestions": (an array of strings with actionable advice to improve the resume)
      }
    `;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error analyzing resume:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
