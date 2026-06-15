import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { verifyAdminRequest } from '@/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const folder = searchParams.get('folder') ?? 'neko-manga';
  const nextCursor = searchParams.get('next_cursor') ?? undefined;

  try {
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: folder,
      max_results: 50,
      next_cursor: nextCursor,
      resource_type: 'image',
    });

    return NextResponse.json({
      resources: result.resources.map((r: Record<string, unknown>) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        width: r.width,
        height: r.height,
        bytes: r.bytes,
        created_at: r.created_at,
        folder: r.folder,
      })),
      next_cursor: result.next_cursor ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
