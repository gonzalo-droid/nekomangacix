import BannersManager from './BannersManager';

export const metadata = { title: 'Banners — Admin | Neko Manga Cix' };

export default function BannersPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Banners / Anuncios</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Gestiona los banners que aparecen en el slider del inicio
        </p>
      </div>
      <BannersManager />
    </div>
  );
}
