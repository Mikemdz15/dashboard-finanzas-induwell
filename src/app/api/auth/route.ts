import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Usuario y contraseña son requeridos' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, username, role, is_banned, password')
      .ilike('username', username)
      .single();

    if (error || !data) {
      if (error && error.code === '42P01') {
         return NextResponse.json({ success: false, error: 'La tabla de usuarios no ha sido creada en Supabase aún.' }, { status: 500 });
      }
      return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }

    if (data.is_banned) {
      return NextResponse.json({ success: false, error: 'Usuario suspendido por el administrador.' }, { status: 403 });
    }

    if (data.password !== password) {
      return NextResponse.json({ success: false, error: 'Credenciales incorrectas' }, { status: 401 });
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        username: data.username,
        role: data.role
      }
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
