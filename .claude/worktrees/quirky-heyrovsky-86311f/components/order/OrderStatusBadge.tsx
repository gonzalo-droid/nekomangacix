import { ORDER_STATE_INFO, type OrderState, type OrderStateColor } from '@/lib/constants/orderStates';

const COLOR_CLASSES: Record<OrderStateColor, string> = {
  amber:   'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50',
  blue:    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50',
  indigo:  'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50',
  emerald: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50',
  orange:  'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/50',
  cyan:    'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800/50',
  green:   'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/50',
  red:     'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800/50',
};

interface Props {
  state: OrderState;
}

export default function OrderStatusBadge({ state }: Props) {
  const info = ORDER_STATE_INFO[state];
  const classes = COLOR_CLASSES[info.color];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold ${classes}`}>
      {info.label}
    </span>
  );
}
