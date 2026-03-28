'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Upload, X, Copy, CheckCircle, ImageIcon, Loader2 } from 'lucide-react';

interface UploadedImage {
  public_id: string;
  secure_url: string;
  name: string;
}

const STORAGE_KEY = 'neko-manga-uploaded-images';

function getStoredImages(): UploadedImage[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveStoredImages(images: UploadedImage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(images));
}

export default function CloudinaryUploader() {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>(getStoredImages);
  const [isUploading, setIsUploading] = useState(false);
  const [imageName, setImageName] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor selecciona un archivo de imagen.');
      return;
    }

    setSelectedFile(file);
    setError('');

    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);

    // Sugerir nombre basado en el archivo
    if (!imageName) {
      const name = file.name.replace(/\.[^/.]+$/, '').replace(/\s+/g, '-').toLowerCase();
      setImageName(name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (imageName.trim()) {
        formData.append('public_id', imageName.trim());
      }

      const res = await fetch('/api/cloudinary/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al subir imagen');
      }

      const data = await res.json();

      const newImage: UploadedImage = {
        public_id: data.public_id,
        secure_url: data.secure_url,
        name: imageName.trim() || selectedFile.name,
      };

      const updated = [newImage, ...uploadedImages];
      setUploadedImages(updated);
      saveStoredImages(updated);

      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setImageName('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCopyName = (publicId: string) => {
    // Extraer solo el nombre sin el folder
    const name = publicId.split('/').pop() || publicId;
    navigator.clipboard.writeText(name);
    setCopiedId(publicId);
    setTimeout(() => setCopiedId(''), 2000);
  };

  const handleRemoveFromList = (publicId: string) => {
    const updated = uploadedImages.filter((img) => img.public_id !== publicId);
    setUploadedImages(updated);
    saveStoredImages(updated);
  };

  return (
    <div className="space-y-6">
      {/* Upload Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Upload size={24} />
          Subir Imagen a Cloudinary
        </h2>

        <div className="space-y-4">
          {/* File Input */}
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              <div className="relative w-full max-w-xs mx-auto aspect-[3/4]">
                <Image
                  src={previewUrl}
                  alt="Preview"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
            ) : (
              <>
                <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Haz clic para seleccionar una imagen
                </p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                  JPG, PNG o WebP
                </p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Image Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nombre de la imagen (public_id)
            </label>
            <input
              type="text"
              value={imageName}
              onChange={(e) => setImageName(e.target.value)}
              placeholder="Ej: jjk-vol1, csm-vol2"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Este nombre es el que usaras en la columna &quot;images&quot; del Excel.
            </p>
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
          )}

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full py-3 bg-[#f97316] text-white rounded-lg font-semibold hover:bg-[#ea580c] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload size={20} />
                Subir a Cloudinary
              </>
            )}
          </button>
        </div>
      </div>

      {/* Uploaded Images List */}
      {uploadedImages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Imagenes Subidas ({uploadedImages.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {uploadedImages.map((img) => (
              <div
                key={img.public_id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
              >
                <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-900">
                  <Image
                    src={img.secure_url}
                    alt={img.name}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {img.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                    {img.public_id.split('/').pop()}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCopyName(img.public_id)}
                      className="flex-1 py-1.5 px-3 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-1"
                    >
                      {copiedId === img.public_id ? (
                        <>
                          <CheckCircle size={14} className="text-green-500" />
                          Copiado
                        </>
                      ) : (
                        <>
                          <Copy size={14} />
                          Copiar nombre
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemoveFromList(img.public_id)}
                      className="py-1.5 px-3 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
