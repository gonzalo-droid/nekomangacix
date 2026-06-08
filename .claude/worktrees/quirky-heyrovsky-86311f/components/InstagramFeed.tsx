'use client';

import Link from 'next/link';

// Placeholder posts - estos se pueden reemplazar con datos reales de la API de Instagram
const instagramPosts = [
  {
    id: '1',
    imageUrl: '/images/instagram/post1.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
  {
    id: '2',
    imageUrl: '/images/instagram/post2.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
  {
    id: '3',
    imageUrl: '/images/instagram/post3.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
  {
    id: '4',
    imageUrl: '/images/instagram/post4.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
  {
    id: '5',
    imageUrl: '/images/instagram/post5.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
  {
    id: '6',
    imageUrl: '/images/instagram/post6.jpg',
    link: 'https://instagram.com/neko.manga.cix',
  },
];

export default function InstagramFeed() {
  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-pink-500"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Síguenos en Instagram
            </h2>
          </div>
          <a
            href="https://instagram.com/neko.manga.cix"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-pink-500 hover:text-pink-600 font-semibold transition-colors"
          >
            @neko.manga.cix
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" x2="21" y1="14" y2="3" />
            </svg>
          </a>
        </div>

        {/* Instagram Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-700 dark:to-gray-800 rounded-lg overflow-hidden"
            >
              {/* Placeholder content - reemplazar con Image cuando tengas las imágenes */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl">📸</span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-pink-600/80 via-purple-600/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="white"
                  className="transform scale-0 group-hover:scale-100 transition-transform duration-300"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" fill="none" stroke="white" strokeWidth="2" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" fill="none" stroke="white" strokeWidth="2" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" stroke="white" strokeWidth="2" />
                </svg>
              </div>
            </a>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center mt-10">
          <a
            href="https://instagram.com/neko.manga.cix"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white font-bold py-3 px-8 rounded-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            Ver más en Instagram
          </a>
        </div>
      </div>
    </section>
  );
}
