export const ORDER_STATES = [
  'pending_deposit',
  'confirmed',
  'in_transit_to_pe',
  'available',
  'pending_balance',
  'shipped',
  'delivered',
  'cancelled',
] as const;

export type OrderState = (typeof ORDER_STATES)[number];

export type OrderStateColor = 'amber' | 'blue' | 'indigo' | 'emerald' | 'orange' | 'cyan' | 'green' | 'red';

type StateInfo = {
  label: string;
  description: string;
  color: OrderStateColor;
  order: number;
  isFinal: boolean;
};

export const ORDER_STATE_INFO: Record<OrderState, StateInfo> = {
  pending_deposit:  { label: 'Pago pendiente',   description: 'Esperando comprobante de pago',     color: 'amber',   order: 1,  isFinal: false },
  confirmed:        { label: 'Confirmado',       description: 'Pago verificado, pedido reservado', color: 'blue',    order: 2,  isFinal: false },
  in_transit_to_pe: { label: 'En camino a Perú', description: 'Preventa en proceso de importación', color: 'indigo',  order: 3,  isFinal: false },
  available:        { label: 'Disponible',       description: 'Pedido listo en nuestro almacén',   color: 'emerald', order: 4,  isFinal: false },
  pending_balance:  { label: 'Saldo pendiente',  description: 'Esperando pago del 50% restante',   color: 'orange',  order: 5,  isFinal: false },
  shipped:          { label: 'Enviado',          description: 'Pedido en camino al cliente',       color: 'cyan',    order: 6,  isFinal: false },
  delivered:        { label: 'Entregado',        description: 'Pedido entregado al cliente',       color: 'green',   order: 7,  isFinal: true  },
  cancelled:        { label: 'Cancelado',        description: 'Pedido cancelado',                  color: 'red',     order: 99, isFinal: true  },
};

export const ORDER_FLOW: readonly OrderState[] = [
  'pending_deposit',
  'confirmed',
  'in_transit_to_pe',
  'available',
  'pending_balance',
  'shipped',
  'delivered',
];

export function isOrderState(value: string): value is OrderState {
  return (ORDER_STATES as readonly string[]).includes(value);
}

export function isFinalState(state: OrderState): boolean {
  return ORDER_STATE_INFO[state].isFinal;
}
