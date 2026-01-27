'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Plus, X, ImageIcon, Trash2 } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}

const STORAGE_KEY = 'neko-manga-gallery';

export default function FairGallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [previewSrc, setPreviewSrc] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setImages(JSON.parse(stored));
      } catch {
        console.error('Error loading gallery images');
      }
    }

    // Enable admin mode with query param ?admin=true
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('admin') === 'true');
  }, []);

  const saveImages = (updatedImages: GalleryImage[]) => {
    setImages(updatedImages);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedImages));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen.');
      return;
    }

    // Max 2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('La imagen debe ser menor a 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddImage = () => {
    if (!previewSrc) return;

    const newImage: GalleryImage = {
      id: Date.now().toString(),
      src: previewSrc,
      caption: caption || 'Feria Neko Manga Cix',
    };

    saveImages([...images, newImage]);
    setShowUploadModal(false);
    setCaption('');
    setPreviewSrc('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteImage = (id: string) => {
    saveImages(images.filter((img) => img.id !== id));
    setSelectedImage(null);
  };

  // Default placeholder images when gallery is empty
  const placeholderImages: GalleryImage[] = [
    { id: 'p1', src: '', caption: 'Feria Manga Chiclayo 2024' },
    { id: 'p2', src: '', caption: 'Stand Neko Manga Cix' },
    { id: 'p3', src: '', caption: 'Encuentro de fans' },
    { id: 'p4', src: '', caption: 'Cosplay & Manga' },
    { id: 'p5', src: '', caption: 'Novedades en feria' },
    { id: 'p6', src: '', caption: 'Nuestro equipo' },
  ];

  const displayImages = images.length > 0 ? images : placeholderImages;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Nuestras Ferias
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Revive los mejores momentos de nuestras ferias y eventos.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 bg-[#f97316] text-white font-semibold py-2 px-4 rounded-lg hover:bg-[#ea580c] transition-colors"
          >
            <Plus size={20} />
            Agregar Foto
          </button>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayImages.map((image) => (
          <button
            key={image.id}
            onClick={() => image.src && setSelectedImage(image)}
            className="group relative overflow-hidden rounded-lg aspect-[4/3] bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 cursor-pointer text-left"
          >
            {image.src ? (
              <Image
                src={image.src}
                alt={image.caption}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <ImageIcon size={48} className="text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-gray-500 dark:text-gray-400 text-sm">{image.caption}</p>
              </div>
            )}
            {image.src && (
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-medium">{image.caption}</p>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {images.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-6 text-sm">
          {isAdmin
            ? 'Aun no hay fotos. Haz clic en "Agregar Foto" para subir imagenes de tus ferias.'
            : 'Proximamente fotos de nuestras ferias y eventos.'}
        </p>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Agregar Foto</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false);
                  setPreviewSrc('');
                  setCaption('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* File Input */}
              <div
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-[#2b496d] dark:hover:border-[#5a7a9e] transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewSrc ? (
                  <div className="relative w-full aspect-video">
                    <Image
                      src={previewSrc}
                      alt="Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <>
                    <ImageIcon className="mx-auto text-gray-400 mb-2" size={40} />
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      Haz clic para seleccionar una imagen
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                      JPG, PNG o WebP (max. 2MB)
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

              {/* Caption */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripcion
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Ej: Feria Manga Chiclayo 2024"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2b496d]"
                />
              </div>

              <button
                onClick={handleAddImage}
                disabled={!previewSrc}
                className="w-full py-3 bg-[#f97316] text-white rounded-lg font-semibold hover:bg-[#ea580c] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Agregar a Galeria
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
            >
              <X size={28} />
            </button>
            <div className="relative w-full aspect-video">
              <Image
                src={selectedImage.src}
                alt={selectedImage.caption}
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-white text-lg">{selectedImage.caption}</p>
              {isAdmin && (
                <button
                  onClick={() => handleDeleteImage(selectedImage.id)}
                  className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors"
                >
                  <Trash2 size={18} />
                  Eliminar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
