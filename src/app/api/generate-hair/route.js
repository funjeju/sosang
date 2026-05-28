import { NextResponse } from 'next/server';

// Vercel Pro Route Segment Config
export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'Gemini API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { image, styleName, styleCategory, promptEng, gender } = await request.json();

    if (!image || !styleName) {
      return NextResponse.json(
        { error: 'Missing image or styleName parameter.' },
        { status: 400 }
      );
    }

    // Clean base64 header (e.g. "data:image/png;base64,abc..." -> "abc...")
    let cleanBase64 = image;
    let mimeType = 'image/png'; // Default fallback

    if (image.startsWith('data:')) {
      const match = image.match(/^data:([^;]+);base64,(.*)$/);
      if (match) {
        mimeType = match[1];
        cleanBase64 = match[2];
      }
    }

    const geminiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`;

    console.log(`1. Calling Gemini 2.5 Flash Image API for style [${styleName}]...`);

    const genderNoun = gender === 'men' ? 'man' : 'woman';
    const hairStylePrompt = promptEng || `${styleName} (${styleCategory})`;
    const randomSeed = Math.random().toString(36).substring(7);
    const timestamp = Date.now();
    const promptText = `A high-end, professional studio portrait of a ${genderNoun} who has the exact same facial features, identity, ethnicity, and expression as the ${genderNoun} in the reference input image. However, you must COMPLETELY REPLACE their hair. They must have a completely different and new hairstyle: ${hairStylePrompt}. The new hair must be integrated naturally onto their head. Set against a clean premium cream studio background with soft warm studio lighting, highly realistic 8k, fashion magazine photoshoot. [Seed Token: ${randomSeed}-${timestamp}]`;

    // Call Gemini Multimodal Content Generation
    const geminiResponse = await fetch(geminiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: promptText
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: cleanBase64
                }
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: ["IMAGE"]
        }
      })
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API Error details:", errorText);
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    
    // Find the inline image in the parts list (handling both camelCase and snake_case)
    const candidates = geminiData.candidates;
    const parts = candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(p => p.inlineData || p.inline_data);
    const inlineDataObj = imagePart?.inlineData || imagePart?.inline_data;
    
    const outputB64 = inlineDataObj?.data;
    const outputMime = inlineDataObj?.mimeType || inlineDataObj?.mime_type || 'image/png';

    if (!outputB64) {
      console.error("Gemini Response structure:", JSON.stringify(geminiData));
      throw new Error("No image data returned from Gemini API.");
    }

    const generatedBase64 = `data:${outputMime};base64,${outputB64}`;
    console.log("2. Image base64 generated successfully by Gemini. Returning payload.");

    return NextResponse.json({ base64Image: generatedBase64 });

  } catch (error) {
    console.error("Error in generate-hair API Route (Gemini):", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
