import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminRequest } from '@/lib/adminAuth';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest();
  if (!auth.ok) return auth.response;

  const { from_public_id, to_public_id, update_products } = await req.json();
  if (!from_public_id || !to_public_id)
    return NextResponse.json({ error: 'from_public_id y to_public_id son requeridos' }, { status: 400 });

  try {
    // Rename in Cloudinary
    await cloudinary.uploader.rename(from_public_id, to_public_id, { overwrite: false });

    let productsUpdated = 0;

    if (update_products) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Find products that reference the old public_id in their images array
      const { data: products } = await supabase
        .from('products')
        .select('id, images')
        .contains('images', [from_public_id]);

      if (products && products.length > 0) {
        for (const product of products) {
          const updatedImages = (product.images as string[]).map((img: string) =>
            img === from_public_id ? to_public_id : img
          );
          await supabase.from('products').update({ images: updatedImages }).eq('id', product.id);
        }
        productsUpdated = products.length;
      }
    }

    return NextResponse.json({ ok: true, productsUpdated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al renombrar' }, { status: 500 });
  }
}
