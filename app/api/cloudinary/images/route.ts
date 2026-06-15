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
  const folder = searchParams.get('folder') ?? '';
  const nextCursor = searchParams.get('next_cursor') ?? undefined;

  try {
    const params: Record<string, unknown> = {
      type: 'upload',
      max_results: 50,
      next_cursor: nextCursor,
      resource_type: 'image',
    };

    if (folder) {
      params.prefix = folder + '/';
    }

    const result = await cloudinary.api.resources(params);

    // Fetch subfolders for navigation
    let subfolders: string[] = [];
    if (folder) {
      const foldersResult = await cloudinary.api.sub_folders(folder).catch(() => ({ folders: [] }));
      subfolders = (foldersResult.folders as { name: string; path: string }[]).map((f) => f.path);
    } else {
      const foldersResult = await cloudinary.api.root_folders().catch(() => ({ folders: [] }));
      subfolders = (foldersResult.folders as { name: string; path: string }[]).map((f) => f.path);
    }

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
      subfolders,
      next_cursor: result.next_cursor ?? null,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error' }, { status: 500 });
  }
}
