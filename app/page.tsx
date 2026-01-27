import Link from 'next/link';
import HomeProductSections from '@/components/HomeProductSections';

export const metadata = {
  title: 'Neko Manga Cix - Inicio',
  description: 'Bienvenido a Neko Manga Cix. La mejor tienda de manga online en Perú.',
};

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#2b496d] via-[#3d6491] to-[#2b496d] text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenido a Neko Manga Cix
          </h1>
          <p className="text-lg md:text-xl mb-8 text-blue-100">
            La mejor tienda de manga online en Perú. Encuentra tus mangas favoritos con envíos
            rápidos a todo el país.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#f97316] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#ea580c] transition-colors duration-300 transform hover:scale-105"
          >
            Ver Productos
          </Link>
        </div>
      </section>

      <HomeProductSections />

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-[#2b496d] to-[#3d6491] rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Tienes dudas sobre tu pedido?
          </h2>
          <p className="text-blue-100 mb-6 text-lg">
            Contacta con nosotros por WhatsApp para consultas sobre productos, promociones y envíos.
          </p>
          <a
            href="https://wa.me/51924462641?text=Hola%20Neko%20Manga%20Cix%2C%20quiero%20consultar%20sobre%20mis%20productos"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#f97316] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#ea580c] transition-colors duration-300"
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-5xl mb-4">🚚</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Envío a todo Perú</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Envíos rápidos y seguros a nivel nacional. Empaque cuidadoso para proteger tus
              mangas.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">💝</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Mejores Precios</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Precios competitivos en toda nuestra colección. Ofertas y promociones especiales
              regularmente.
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Amplio Catálogo</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Miles de títulos disponibles. Desde clásicos hasta los lanzamientos más recientes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
