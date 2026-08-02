import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import ManualOrderForm from './ManualOrderForm';

export const metadata: Metadata = {
  title: 'Admin — Cargar pedido manual',
  robots: { index: false },
};

export default function NewManualOrderPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link href="/admin/orders" className="flex items-center text-[#2b496d] dark:text-[#5a7a9e] hover:underline mb-4 text-sm">
        <ChevronLeft size={16} />
        Volver a Pedidos
      </Link>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Cargar pedido manual</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
        Para ventas presenciales o directas que no pasaron por el checkout web.
      </p>
      <ManualOrderForm />
    </div>
  );
}
