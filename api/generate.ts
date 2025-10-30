// IMPORTANT: This file should be placed in an `api` directory
// at the root of your project. For example: `/api/generate.ts`
// Cloud providers like Vercel will automatically deploy this as a serverless function.

import { GoogleGenAI, Modality } from "@google/genai";

interface ImageData {
  base64: string;
  mimeType: string;
}

interface RequestBody {
    productImage: ImageData;
    modelImage: ImageData;
}

// This is a generic handler that works with Vercel's Edge Functions
// and other modern serverless platforms.
export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API_KEY environment variable not set on the server.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const { productImage, modelImage } = (await request.json()) as RequestBody;

    if (!productImage || !modelImage) {
        return new Response(JSON.stringify({ error: 'Missing product or model image data.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    const ai = new GoogleGenAI({ apiKey });
  
    const productPart = {
      inlineData: { data: productImage.base64, mimeType: productImage.mimeType },
    };
    const modelPart = {
      inlineData: { data: modelImage.base64, mimeType: modelImage.mimeType },
    };
    const textPart = {
      text: "Photorealistically place the garment from the first image onto the model in the second image. Match the model's pose, lighting, and shadows. Output only the final composed image.",
    };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [productPart, modelPart, textPart] },
        config: { responseModalities: [Modality.IMAGE] },
    });

    const firstCandidate = response.candidates?.[0];
    if (firstCandidate) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          return new Response(JSON.stringify({ generatedImage: part.inlineData.data }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    }
    
    throw new Error("The AI model did not return an image. This can happen with complex requests or if the input images are not clear. Please try again with different images.");

  } catch (error) {
    console.error("Gemini API call failed in serverless function:", error);
    const message = error instanceof Error ? error.message : "An unknown error occurred.";
    return new Response(JSON.stringify({ error: `Failed to generate image due to an API error: ${message}` }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }
}