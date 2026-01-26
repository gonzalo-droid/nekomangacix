import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, Instagram, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-100 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sobre Nosotros */}
          <div>
            <Image
              src="/images/logo-dark.png"
              alt="Neko Manga Cix"
              width={150}
              height={40}
              className="h-10 w-auto mb-4"
            />
            <p className="text-gray-400 text-sm">
              Tu tienda de manga online de confianza. Envíos a todo Perú.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Nosotros
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-2">
                <MessageCircle size={16} className="text-green-400" />
                <a
                  href="https://wa.me/51924462641"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-green-400 transition-colors"
                >
                  +51 924 462 641
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Instagram size={16} className="text-pink-400" />
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-pink-400 transition-colors"
                >
                  @NekoMangaCix
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin size={16} className="text-red-400" />
                <span className="text-gray-400">Chiclayo, Perú</span>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Términos y Condiciones
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Políticas de Envío
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-[#5a7a9e] transition-colors">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} Neko Manga Cix. Todos los derechos reservados.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Hecho con ❤️ para los amantes del manga
          </p>
        </div>
      </div>
    </footer>
  );
}
