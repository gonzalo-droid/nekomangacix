import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface BannerMeta {
  title?: string;
  subtitle?: string;
  link?: string;
  type?: string;
}

/**
 * Textos de cada banner, opcionales, en `public/images/banners/banners.json`:
 *
 *   { "banner-01.png": { "title": "…", "subtitle": "…", "link": "/products", "type": "preventa" } }
 *
 * El `title` es el texto alternativo de la imagen, así que debe describir la
 * promoción. Sin manifiesto se cae al nombre del archivo, que no sirve como
 * alternativa accesible — por eso conviene mantenerlo al día al subir un banner.
 */
function readManifest(dir: string): Record<string, BannerMeta> {
  try {
    const raw = fs.readFileSync(path.join(dir, 'banners.json'), 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, BannerMeta>;
    }
  } catch {
    // Sin manifiesto o con JSON inválido: se usan los nombres de archivo.
  }
  return {};
}

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'banners');
    const files = fs.readdirSync(dir).filter((f) =>
      /\.(png|jpg|jpeg|webp|avif)$/i.test(f)
    );
    const manifest = readManifest(dir);

    const data = files.map((f, i) => {
      const meta = manifest[f] ?? {};
      const fallbackTitle = f
        .replace(/\.(png|jpg|jpeg|webp|avif)$/i, '')
        .replace(/-/g, ' ');

      return {
        id: f,
        title: meta.title?.trim() || fallbackTitle,
        subtitle: meta.subtitle?.trim() || undefined,
        link: meta.link?.trim() || undefined,
        image_url: `/images/banners/${f}`,
        type: meta.type?.trim() || 'general',
        is_active: true,
        sort_order: i,
      };
    });

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
