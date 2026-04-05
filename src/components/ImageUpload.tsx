import React, { useState } from 'react';
import { Upload, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  initialImage?: string;
  folder?: string;
}

export default function ImageUpload({ onUploadComplete, initialImage, folder = 'general' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(initialImage && initialImage !== '' ? initialImage : null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const msg = 'Please upload an image file.';
      setError(msg);
      toast.error(msg);
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const msg = 'File size must be less than 5MB.';
      setError(msg);
      toast.error(msg);
      return;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_IMGBB_API_KEY;
      if (!apiKey) {
        throw new Error('ImgBB API Key is missing. Please ensure you have added VITE_IMGBB_API_KEY to your environment variables in the Settings menu.');
      }

      const formData = new FormData();
      formData.append('image', file);

      // ImgBB doesn't support progress natively with fetch easily, so we'll simulate it or just show loading
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || 'Failed to upload image to ImgBB';
        if (errorMessage.includes('Invalid API v1 key')) {
          throw new Error('The ImgBB API Key provided is invalid. Please check your VITE_IMGBB_API_KEY in the Settings menu.');
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      const url = result.data.url;

      setPreview(url);
      onUploadComplete(url);
      setUploading(false);
      toast.success('Image uploaded successfully!');
    } catch (err: any) {
      console.error('Upload error:', err);
      const msg = err.message || 'Failed to upload image. Please try again.';
      setError(msg);
      toast.error(msg);
      setUploading(false);
    }
  };

  const clearImage = () => {
    setPreview(null);
    onUploadComplete('');
    toast.success('Image removed');
  };

  return (
    <div className="space-y-4">
      <div className="relative group">
        {preview ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 border border-gray-200">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button
              onClick={clearImage}
              className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-md text-red-500 rounded-xl shadow-sm hover:bg-red-50 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-2 left-2 px-3 py-1 bg-green-500/90 backdrop-blur-md text-white text-[10px] font-bold rounded-full flex items-center">
              <CheckCircle2 className="w-3 h-3 mr-1" /> Uploaded
            </div>
          </div>
        ) : (
          <label className={`
            flex flex-col items-center justify-center aspect-video rounded-2xl border-2 border-dashed transition-all cursor-pointer relative overflow-hidden
            ${uploading ? 'bg-gray-50 border-gray-200' : 'bg-gray-50 border-gray-200 hover:border-brand-orange hover:bg-brand-orange/5'}
          `}>
            {uploading ? (
              <div className="flex flex-col items-center z-10">
                <Loader2 className="w-8 h-8 text-brand-orange animate-spin mb-2" />
                <span className="text-sm font-bold text-gray-500">Uploading {Math.round(progress)}%</span>
                <div className="w-32 h-1 bg-gray-200 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="h-full bg-brand-orange transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center px-6 text-center">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm font-bold text-gray-700">Click to upload image</span>
                <span className="text-xs text-gray-400 mt-1">PNG, JPG or WEBP (Max 5MB)</span>
              </div>
            )}
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        )}
      </div>
      {error && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-100">
          <p className="text-xs font-bold text-red-500 flex items-start">
            <AlertCircle className="w-3 h-3 mr-1.5 mt-0.5 flex-shrink-0" /> 
            <span>{error}</span>
          </p>
        </div>
      )}
    </div>
  );
}
