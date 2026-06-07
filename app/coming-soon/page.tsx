import type { Metadata } from 'next'
import ComingSoonClient from './ComingSoonClient'

export const metadata: Metadata = {
  title: 'Próximamente · NEKO MANGA CIX',
  description: 'Estamos trabajando en algo increíble. ¡Vuelve pronto!',
  robots: { index: false, follow: false },
}

export default function ComingSoonPage() {
  const launchDate = process.env.LAUNCH_DATE ?? '2026-09-01'
  return <ComingSoonClient launchDate={launchDate} />
}
