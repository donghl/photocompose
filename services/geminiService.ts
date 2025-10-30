interface ImageData {
  base64: string;
  mimeType: string;
}

export async function generateStyledImage(productImage: ImageData, modelImage: ImageData): Promise<string> {
  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ productImage, modelImage }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.generatedImage;

  } catch (error) {
    console.error("API call to '/api/generate' failed:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}
