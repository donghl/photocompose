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

    // Serverless functions can timeout and return non-JSON (e.g., HTML error pages).
    // We read the response as text first to handle this gracefully.
    const responseText = await response.text();

    if (!response.ok) {
        // Try to parse as JSON, in case it's a structured error from our own API logic.
        try {
            const errorJson = JSON.parse(responseText);
            throw new Error(errorJson.error || `Request failed with status ${response.status}`);
        } catch (e) {
            // It wasn't JSON, so it's likely a platform error page.
            throw new Error(`Request failed with status ${response.status}. The server response was not valid JSON.`);
        }
    }

    // If response.ok is true, we expect JSON.
    try {
        const result = JSON.parse(responseText);
        if (!result.generatedImage) {
            throw new Error("API response did not contain a generated image.");
        }
        return result.generatedImage;
    } catch (e) {
        // This catches JSON parsing errors on a 200 OK response, which is a classic sign
        // of a serverless function timeout returning an HTML error page.
        console.error("Failed to parse successful response as JSON. Body:", responseText);
        throw new Error("Received an unexpected response from the server. This can happen during a server timeout. Please try again.");
    }

  } catch (error) {
    console.error("API call to '/api/generate' failed:", error);
    if (error instanceof Error) {
        // Re-throw the already descriptive error from the blocks above.
        throw new Error(`Failed to generate image: ${error.message}`);
    }
    throw new Error("An unknown error occurred while generating the image.");
  }
}