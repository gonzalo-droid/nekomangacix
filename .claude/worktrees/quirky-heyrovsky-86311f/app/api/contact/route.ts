import nodemailer from 'nodemailer';
import { NextRequest, NextResponse } from 'next/server';

const GMAIL_USER = 'nekomangacix@gmail.com';

interface ContactPayload {
  nombre: string;
  email: string;
  asunto: string;
  mensaje: string;
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as Partial<ContactPayload>;
  const { nombre, email, asunto, mensaje } = body;

  if (!nombre?.trim() || !email?.trim() || !asunto?.trim() || !mensaje?.trim()) {
    return NextResponse.json({ error: 'Todos los campos son requeridos.' }, { status: 400 });
  }

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'El email no es válido.' }, { status: 400 });
  }

  const appPassword = process.env.GMAIL_APP_PASSWORD;
  if (!appPassword) {
    console.log('[contact] GMAIL_APP_PASSWORD no configurado. Mensaje de:', nombre, email);
    return NextResponse.json({ success: true });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: GMAIL_USER,
      pass: appPassword,
    },
  });

  try {
    await transporter.sendMail({
      from: `"Neko Manga Cix" <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: `"${nombre}" <${email}>`,
      subject: `[Contacto] ${asunto} — ${nombre}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2b496d;">Nuevo mensaje de contacto</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #666;">Nombre:</td><td style="padding: 8px 0; font-weight: bold;">${nombre}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="padding: 8px 0;">${email}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Asunto:</td><td style="padding: 8px 0;">${asunto}</td></tr>
          </table>
          <hr style="margin: 16px 0; border-color: #eee;"/>
          <p style="white-space: pre-wrap; color: #333;">${mensaje}</p>
          <hr style="margin: 16px 0; border-color: #eee;"/>
          <p style="color: #999; font-size: 12px;">Enviado desde nekomangacix.com</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('[contact] Gmail error:', err);
    return NextResponse.json({ error: 'Error al enviar el mensaje. Inténtalo más tarde.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
