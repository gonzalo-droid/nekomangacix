'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryImage {
  id: string;
  src: string;
  caption: string;
}

const galleryImages: GalleryImage[] = [
  { id: '1', src: '/events/event_1.jpeg', caption: 'Día del coleccionista' },
  { id: '3', src: '/events/event_3.jpeg', caption: 'Stand de Neko Manga' },
  { id: '5', src: '/events/event_5.jpeg', caption: 'Feria Japonesa' },
  { id: '6', src: '/events/event_6.jpeg', caption: 'AnimeFest Lima' },
  { id: '7', src: '/events/event_7.jpeg', caption: 'Camino a AnimeFest' },
  { id: '8', src: '/events/event_8.jpeg', caption: 'Evento especial' },
  { id: '9', src: '/events/event_9.jpeg', caption: 'Atendiendolos' },
  { id: '10', src: '/events/event_10.jpeg', caption: 'Team otaku' },
  { id: '11', src: '/events/event_11.jpeg', caption: 'Club de manga' },
];

export default function FairGallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Nuestras Ferias
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Revive los mejores momentos de nuestras ferias y eventos.
        </p>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {galleryImages.map((image) => (
          <button
            key={image.id}
            onClick={() => setSelectedImage(image)}
            className="group relative overflow-hidden rounded-lg aspect-[2/3] bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 cursor-pointer text-left"
          >
            <Image
              src={image.src}
              alt={image.caption}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-white font-medium">{image.caption}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

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
            <p className="text-white text-lg mt-4">{selectedImage.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
