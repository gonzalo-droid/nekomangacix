import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const dir = path.join(process.cwd(), 'public', 'images', 'banners');
    const files = fs.readdirSync(dir).filter((f) =>
      /\.(png|jpg|jpeg|webp|avif)$/i.test(f)
    );

    const data = files.map((f, i) => ({
      id: f,
      title: f.replace(/\.(png|jpg|jpeg|webp|avif)$/i, '').replace(/-/g, ' '),
      image_url: `/images/banners/${f}`,
      type: 'general',
      is_active: true,
      sort_order: i,
    }));

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
