import Link from 'next/link';
import FairGallery from '@/components/FairGallery';
import Image from 'next/image';

export const metadata = {
  title: 'Nosotros - Neko Manga Cix',
  description: 'Conoce más sobre Neko Manga Cix, tu tienda de manga online en Perú.',
};

export default function AboutPage() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#2b496d] to-[#3d6491] text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Sobre Neko Manga Cix</h1>
          <p className="text-lg md:text-xl text-blue-100">
            Somos más que una tienda. Somos una comunidad apasionada por el manga y el anime.
          </p>
        </div>
      </section>

      {/* About Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Nuestra Misión
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              En Neko Manga Cix, creemos que el manga es más que simple entretenimiento. Es una forma de arte, una ventana a diferentes culturas y una fuente de inspiración infinita.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-4">
              Nuestra misión es hacer accesible el manga a todos los amantes de esta increíble industria en Perú, proporcionando una amplia selección de títulos, precios competitivos y un servicio al cliente excepcional.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Nos esforzamos por ser la tienda de manga más confiable y amigable de Chiclayo y el Perú.
            </p>
          </div>
          <div className="bg-gradient-to-br from-[#e8eef4] to-[#d1dce8] dark:from-gray-800 dark:to-gray-700 rounded-lg p-12 flex items-center justify-center min-h-64">
              
            <Image
                         src="/images/logo-light.png"
                         alt="Neko Manga Cix"
                         width={300}
                         height={100}
                         className="h-auto w-auto dark:hidden"
                         priority
                       />         
          </div>
        </div>

        {/* Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">💎</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Calidad</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Nos comprometemos a ofrecerte solo productos auténticos y en perfecto estado. Cada manga es verificado antes de ser enviado.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Confianza</h3>
            <p className="text-gray-600 dark:text-gray-300">
              La relación con nuestros clientes es lo más importante. Nos comprometemos a ser transparentes y honestos en todas nuestras operaciones.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 hover:shadow-lg transition-shadow">
            <div className="text-5xl mb-4">❤️</div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Pasión</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Somos fans de manga como tú. Nuestro amor por esta industria impulsa todo lo que hacemos.
            </p>
          </div>
        </div>

        {/* Fair Gallery Section */}
        <div className="mb-16">
          <FairGallery />
        </div>

        {/* Services Section */}
        <div className="bg-gradient-to-r from-[#e8eef4] to-[#f0f4f8] dark:from-gray-800 dark:to-gray-800 rounded-lg p-12 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-12">Nuestros Servicios</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">🚚</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Envío a Nivel Nacional</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Enviamos a todo Perú con empaque seguro que protege tus mangas. Contamos con diferentes opciones de envío.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">💝</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Precios Competitivos</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ofrecemos los mejores precios del mercado sin comprometer la calidad de nuestros productos.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">💬</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Atención al Cliente 24/7</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Contacta con nosotros por WhatsApp en cualquier momento para consultas y soporte.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-3xl flex-shrink-0">📚</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Amplio Catálogo</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Desde clásicos hasta lanzamientos recientes. Títulos de editoriales argentinas, mexicanas y más.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-12 flex items-center justify-center min-h-64 border-2 border-red-200 dark:border-red-800">
            <div className="text-center">
              <div className="text-8xl mb-4">📍</div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Ubicación</h3>
              <p className="text-gray-600 dark:text-gray-300 text-lg">Chiclayo, Perú</p>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Sirviendo a todo el país</p>
            </div>
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
              Contáctanos
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              ¿Tienes preguntas o deseas hacer un pedido? Contacta con nosotros a través de WhatsApp. Nuestro equipo está disponible para ayudarte.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Información de Contacto</h3>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  <a
                    href="https://wa.me/51924462641"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#1e3550] dark:hover:text-[#7a9abe] font-semibold"
                  >
                    (+51) 924 462 641
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">📍</span>
                  Chiclayo, Perú
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-2xl">🌐</span>
                  <a
                    href="https://www.instagram.com/neko.manga.cix/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#2b496d] dark:text-[#5a7a9e] hover:text-[#1e3550] dark:hover:text-[#7a9abe] font-semibold"
                  >
                    @neko.manga.cix
                  </a>
                </li>
              </ul>
            </div>
            <Link
              href="/contact"
              className="inline-block bg-[#2b496d] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#1e3550] transition-colors"
            >
              Enviar Mensaje
            </Link>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-[#2b496d] to-[#3d6491] rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Listo para tu próxima aventura manga?
          </h2>
          <p className="text-blue-100 mb-8 text-lg">
            Explora nuestra colección y encuentra tus títulos favoritos.
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#f97316] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#ea580c] transition-colors"
          >
            Ver Todos los Productos
          </Link>
        </div>
      </section>
    </div>
  );
}
