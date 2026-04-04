import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const PRODUCTS_FOLDER = 'neko-manga';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const publicId = formData.get('public_id') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No se proporcionó archivo' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<{ public_id: string; secure_url: string }>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: PRODUCTS_FOLDER,
            public_id: publicId || undefined,
            overwrite: true,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('No result from Cloudinary'));
            resolve({
              public_id: result.public_id,
              secure_url: result.secure_url,
            });
          }
        );
        uploadStream.end(buffer);
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error al subir imagen' },
      { status: 500 }
    );
  }
}
