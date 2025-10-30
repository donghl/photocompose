
import { GoogleGenAI, Modality } from "@google/genai";

interface ImageData {
  base64: string;
  mimeType: string;
}

export async function generateStyledImage(productImage: ImageData, modelImage: ImageData): Promise<string> {
  // Assume process.env.API_KEY is available in the environment
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const productPart = {
    inlineData: {
      data: productImage.base64,
      mimeType: productImage.mimeType,
    },
  };

  const modelPart = {
    inlineData: {
      data: modelImage.base64,
      mimeType: modelImage.mimeType,
    },
  };

  const textPart = {
    text: "You are an expert fashion photo editor. Your task is to take a product image (first image) and a model image (second image) and create a new, photorealistic image where the model is wearing the product. The final image should be seamless, maintaining the lighting, shadows, pose, and overall style of the original model image. The product should fit naturally on the model as if it were part of the original photoshoot. Do not add any text, logos, or extra elements. Output only the final edited image.",
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [productPart, modelPart, textPart],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const firstCandidate = response.candidates?.[0];
    if (firstCandidate) {
      for (const part of firstCandidate.content.parts) {
        if (part.inlineData) {
          return part.inlineData.data;
        }
      }
    }
    
    throw new Error("No image data found in the API response.");

  } catch (error) {
    console.error("Gemini API call failed:", error);
    throw new Error("Failed to generate image due to an API error.");
  }
}
