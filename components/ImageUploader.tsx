
import React from 'react';

interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

interface ImageUploaderProps {
  id: string;
  label: string;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imageData: ImageData | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ id, label, onImageChange, imageData }) => {
  const previewUrl = imageData ? `data:${imageData.mimeType};base64,${imageData.base64}` : null;

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="text-lg font-semibold text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative w-full aspect-square bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center text-center p-4 transition-all duration-300 hover:border-purple-500 hover:bg-gray-50 dark:hover:bg-gray-700">
        <input
          id={id}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={onImageChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        {previewUrl ? (
          <div className="relative w-full h-full">
            <img src={previewUrl} alt="Preview" className="object-contain w-full h-full rounded-xl" />
            <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-50 text-white text-xs p-1 rounded truncate">
              {imageData?.name}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 dark:text-gray-400">
             <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            <p className="mt-2 font-semibold">Click to upload</p>
            <p className="text-sm">or drag and drop</p>
            <p className="text-xs mt-1">PNG, JPG, WEBP</p>
          </div>
        )}
      </div>
    </div>
  );
};
