import { NextResponse } from 'next/server';

export async function POST(request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OpenAI API key is not configured.' },
      { status: 500 }
    );
  }

  try {
    const { image, styleName, styleCategory } = await request.json();

    if (!image || !styleName) {
      return NextResponse.json(
        { error: 'Missing image or styleName parameter.' },
        { status: 400 }
      );
    }

    // Ensure the image base64 format is clean (remove header if present)
    let cleanBase64 = image;
    if (image.startsWith('data:image')) {
      cleanBase64 = image; // Keep full data URL for vision API
    } else {
      cleanBase64 = `data:image/jpeg;base64,${image}`;
    }

    console.log("1. Calling GPT-4o-mini Vision to analyze the user portrait...");

    // Call GPT-4o-mini Vision to get details of the face/person, excluding hair
    const visionResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Describe the person in this image in detail (gender, ethnicity, age range, facial features like eyes, nose, lips, skin tone, current expression, clothing) in 1-2 concise sentences. Do NOT mention their current hair style, hair length, hair color, or anything about their head hair at all.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: cleanBase64
                }
              }
            ]
          }
        ],
        max_tokens: 120
      })
    });

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error("GPT Vision Error:", errorText);
      throw new Error(`OpenAI Vision API error: ${visionResponse.statusText}`);
    }

    const visionData = await visionResponse.json();
    const description = visionData.choices[0].message.content;
    console.log("GPT Vision Portrait Analysis Result:", description);

    // Formulate prompt for DALL-E 3
    const generationPrompt = `A professional, high-end close-up studio portrait of a person who is: ${description}. But their hairstyle must be a ${styleName} (${styleCategory}), professional styling, luxury cream background, warm studio lighting, highly realistic 8k, fashion magazine photoshoot.`;
    console.log("2. Generating style simulation using DALL-E 3 with prompt:", generationPrompt);

    // Call DALL-E 3
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'dalle-3',
        prompt: generationPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard'
      })
    });

    if (!dalleResponse.ok) {
      const errorText = await dalleResponse.text();
      console.error("DALL-E 3 Error:", errorText);
      throw new Error(`OpenAI DALL-E API error: ${dalleResponse.statusText}`);
    }

    const dalleData = await dalleResponse.json();
    const imageUrl = dalleData.data[0].url;
    console.log("DALL-E 3 Image Generated successfully:", imageUrl);

    // Fetch the image from CDN and convert to base64 so it can be saved persistently
    const imageFetch = await fetch(imageUrl);
    if (!imageFetch.ok) {
      // Fallback: just return the CDN URL if we fail to convert to base64
      return NextResponse.json({ imageUrl });
    }

    const arrayBuffer = await imageFetch.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const generatedBase64 = `data:image/png;base64,${buffer.toString('base64')}`;

    console.log("3. Image converted to base64 successfully. Returning payload.");
    return NextResponse.json({ base64Image: generatedBase64 });

  } catch (error) {
    console.error("Error in generate-hair API Route:", error);
    return NextResponse.json(
      { error: error.message || 'Internal server error.' },
      { status: 500 }
    );
  }
}
