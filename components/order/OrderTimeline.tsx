import { ORDER_FLOW, ORDER_STATE_INFO, type OrderState } from '@/lib/constants/orderStates';

interface Props {
  current: OrderState;
}

export default function OrderTimeline({ current }: Props) {
  if (current === 'cancelled') {
    return (
      <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50">
        <span className="text-2xl" aria-hidden="true">❌</span>
        <div>
          <p className="text-sm font-bold text-red-800 dark:text-red-300">Pedido cancelado</p>
          <p className="text-xs text-red-700 dark:text-red-400">
            {ORDER_STATE_INFO.cancelled.description}
          </p>
        </div>
      </div>
    );
  }

  const currentOrder = ORDER_STATE_INFO[current].order;

  return (
    <ol className="space-y-3">
      {ORDER_FLOW.map((step, idx) => {
        const info = ORDER_STATE_INFO[step];
        const isDone = info.order < currentOrder;
        const isActive = step === current;
        const isFuture = info.order > currentOrder;

        let circle: React.ReactNode;
        if (isDone) {
          circle = (
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center shadow-sm">
              ✓
            </span>
          );
        } else if (isActive) {
          circle = (
            <span className="relative flex-shrink-0 w-7 h-7">
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-pulse opacity-75" aria-hidden="true" />
              <span className="relative w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-sm">
                {idx + 1}
              </span>
            </span>
          );
        } else {
          circle = (
            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold flex items-center justify-center">
              {idx + 1}
            </span>
          );
        }

        return (
          <li
            key={step}
            className={`flex items-start gap-3 ${isFuture ? 'opacity-50' : ''}`}
          >
            {circle}
            <div className="flex-1 min-w-0 pt-0.5">
              <p className={`text-sm font-semibold ${isActive ? 'text-blue-700 dark:text-blue-300' : 'text-gray-900 dark:text-white'}`}>
                {info.label}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{info.description}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
