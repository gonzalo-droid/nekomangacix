'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import { Trash2, Plus, Minus } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCart();

  const handleWhatsAppCheckout = () => {
    if (items.length === 0) return;

    const cartDetails = items
      .map((item) => `${item.title} (${item.quantity}x) - S/ ${(item.price * item.quantity).toFixed(2)}`)
      .join('\n');

    const total = getTotalPrice();
    const shipping = 20; // Envío plano
    const finalTotal = total + shipping;

    const message = `Hola, quiero finalizar mi pedido:\n\n${cartDetails}\n\nSubtotal: S/ ${total.toFixed(2)}\nEnvío: S/ ${shipping.toFixed(2)}\nTotal: S/ ${finalTotal.toFixed(2)}\n\n¿Puedes confirmar disponibilidad y envío?`;

    const whatsappUrl = `https://wa.me/51924462641?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const subtotal = getTotalPrice();
  const shipping = subtotal > 0 ? 20 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-12">Carrito de Compras</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <p className="text-2xl font-semibold text-gray-900 mb-4">Tu carrito está vacío</p>
          <p className="text-gray-600 mb-8">Empieza a agregar mangas a tu carrito desde nuestra colección.</p>
          <Link
            href="/products"
            className="inline-block bg-purple-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Ver Productos
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="p-6 border-b border-gray-200 flex gap-6 items-start hover:bg-gray-50 transition-colors"
                >
                  {/* Product Image Placeholder */}
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <div className="text-3xl">📚</div>
                  </div>

                  {/* Product Info */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600 mb-4">{item.editorial}</p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-semibold text-gray-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="p-1 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right flex flex-col justify-between h-full">
                    <div>
                      <p className="text-2xl font-bold text-purple-600">S/ {(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-500">S/ {item.price.toFixed(2)} c/u</p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded p-2 transition-colors"
                      aria-label={`Eliminar ${item.title} del carrito`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Continue Shopping */}
            <div className="mt-8">
              <Link
                href="/products"
                className="text-purple-600 hover:text-purple-700 font-semibold"
              >
                ← Continuar comprando
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-8 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Pedido</h2>

              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">S/ {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Envío estimado</span>
                  <span className="font-semibold text-gray-900">S/ {shipping.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-purple-600">S/ {total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleWhatsAppCheckout}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 mb-4"
              >
                💬 Finalizar Pedido por WhatsApp
              </button>

              <p className="text-sm text-gray-500 text-center">
                Serás redirigido a WhatsApp para confirmar tu pedido con nuestro equipo.
              </p>

              {/* Info Box */}
              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>📍 Envío:</strong> El envío es a nivel nacional. Consulta tiempos de envío según tu ubicación.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
