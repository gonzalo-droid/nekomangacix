import { ShieldCheck, Truck, PackageCheck, Gift, MessageCircle } from 'lucide-react';

const BADGES = [
  {
    icon: ShieldCheck,
    title: 'Producto 100% Original',
    subtitle: 'Directo desde editorial',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
  },
  {
    icon: Truck,
    title: 'Envíos a todo el Perú',
    subtitle: 'Olva Courier, Shalom',
    color: 'text-[#06b6d4]',
    bg: 'bg-[#06b6d4]/10',
  },
  {
    icon: PackageCheck,
    title: 'Entrega Segura',
    subtitle: 'Embalaje protegido',
    color: 'text-[#5a7a9e]',
    bg: 'bg-[#5a7a9e]/10',
  },
  {
    icon: Gift,
    title: 'Obsequios Especiales',
    subtitle: 'En cada compra',
    color: 'text-[#ec4899]',
    bg: 'bg-[#ec4899]/10',
  },
  {
    icon: MessageCircle,
    title: 'Soporte por WhatsApp',
    subtitle: 'Respuesta rápida',
    color: 'text-[#25D366]',
    bg: 'bg-[#25D366]/10',
  },
];

interface Props {
  variant?: 'full' | 'compact';
  className?: string;
}

export default function TrustBadges({ variant = 'full', className = '' }: Props) {
  if (variant === 'compact') {
    return (
      <div className={`grid grid-cols-2 sm:grid-cols-5 gap-3 ${className}`}>
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="flex flex-col items-center text-center gap-1.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
            >
              <div className={`p-2 rounded-full ${b.bg}`}>
                <Icon size={18} className={b.color} />
              </div>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">{b.title}</p>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <section className={`${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {BADGES.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.title}
              className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              <div className={`flex-shrink-0 p-2.5 rounded-full ${b.bg}`}>
                <Icon size={22} className={b.color} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{b.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{b.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
