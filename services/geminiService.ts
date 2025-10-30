
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
      let errorMessage;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
            const errorData = await response.json();
            errorMessage = errorData.error || `Request failed with status ${response.status}`;
        } catch (jsonError) {
            errorMessage = `Failed to parse JSON error response. Status: ${response.status}`;
        }
      } else {
        // Not a JSON response, read as text. This handles server errors (e.g., timeouts) that return HTML/text.
        const errorText = await response.text();
        errorMessage = `Request failed with status ${response.status}. Server response: ${errorText.substring(0, 200)}...`; // Truncate for display
      }
      throw new Error(errorMessage);
    }

    const result = await response.json();
    if (!result.generatedImage) {
        throw new Error("API response did not contain a generated image.");
    }
    return result.generatedImage;

  } catch (error) {
    console.error("API call to '/api/generate' failed:", error);
    if (error instanceof Error) {
        // The error message is already well-formatted from the `if (!response.ok)` block
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}
