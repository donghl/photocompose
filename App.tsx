
import React, { useState, useCallback } from 'react';
import { ImageUploader } from './components/ImageUploader';
import { Spinner } from './components/Spinner';
import { generateStyledImage } from './services/geminiService';
import { fileToBase64 } from './utils/imageUtils';

interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

const App: React.FC = () => {
  const [productImage, setProductImage] = useState<ImageData | null>(null);
  const [modelImage, setModelImage] = useState<ImageData | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = useCallback(async (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<ImageData | null>>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const { base64, mimeType } = await fileToBase64(file);
        setter({ base64, mimeType, name: file.name });
      } catch (err) {
        setError('Failed to read image file.');
        console.error(err);
      }
    }
  }, []);

  const handleGenerate = async () => {
    if (!productImage || !modelImage) {
      setError('Please upload both a product and a model image.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);

    try {
      const resultBase64 = await generateStyledImage(productImage, modelImage);
      setGeneratedImage(`data:image/png;base64,${resultBase64}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Image generation failed: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
            AI Virtual Try-On
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Upload a product and a model image, and let our AI create the perfect fit.
          </p>
        </header>

        <main>
          {error && (
            <div className="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
              <strong className="font-bold">Error: </strong>
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <ImageUploader
              id="product-image"
              label="1. Upload Product"
              onImageChange={(e) => handleImageChange(e, setProductImage)}
              imageData={productImage}
            />
            <ImageUploader
              id="model-image"
              label="2. Upload Model"
              onImageChange={(e) => handleImageChange(e, setModelImage)}
              imageData={modelImage}
            />
            <div className="flex flex-col space-y-2">
              <label className="text-lg font-semibold text-gray-700 dark:text-gray-300">3. Generated Result</label>
              <div className="relative w-full aspect-square bg-gray-200 dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden shadow-inner">
                {isLoading && <Spinner />}
                {!isLoading && generatedImage && (
                  <img src={generatedImage} alt="Generated result" className="object-contain w-full h-full" />
                )}
                {!isLoading && !generatedImage && (
                   <div className="text-center text-gray-500 p-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    <p className="mt-2">Your generated image will appear here.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleGenerate}
              disabled={!productImage || !modelImage || isLoading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-lg"
            >
              {isLoading ? 'Generating...' : '✨ Generate Image'}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
