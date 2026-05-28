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
    const { image, styleName, styleCategory, promptEng } = await request.json();

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

    const hairStylePrompt = promptEng || `${styleName} (${styleCategory})`;
    const promptText = `Modify the hair of the person in the input image. You must COMPLETELY REPLACE their current hairstyle with this new hairstyle: ${hairStylePrompt}. Keep the person's facial features, eyes, nose, lips, head pose, age range, gender, and expression similar to the input image so they look like the same person, but the hair must be completely changed and naturally integrated. Place them against a professional premium luxury cream studio background with warm soft studio lighting, 8k resolution, highly detailed fashion magazine photoshoot.`;

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
