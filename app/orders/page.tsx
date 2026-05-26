import { redirect } from 'next/navigation';

export default function OrdersRedirect() {
  redirect('/profile?tab=orders');
}
