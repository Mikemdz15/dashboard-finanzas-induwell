import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: usersData, error } = await supabase
      .from('users')
      .select('id, username, role, is_banned, created_at')
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
         return NextResponse.json({ success: true, users: [] });
      }
      throw error;
    }

    return NextResponse.json({ success: true, users: usersData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, username, password, role } = body;

    if (!username) {
      return NextResponse.json({ success: false, error: 'Falta el nombre de usuario' }, { status: 400 });
    }

    if (action === 'create') {
      if (!password) return NextResponse.json({ success: false, error: 'Falta la contraseña' }, { status: 400 });
      
      const { error } = await supabase
        .from('users')
        .insert([{ username, password, role: role || 'user' }]);
        
      if (error) throw error;
      
    } else if (action === 'delete') {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('username', username);
        
      if (error) throw error;
      
    } else if (action === 'ban') {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: true })
        .eq('username', username);
      if (error) throw error;
      
    } else if (action === 'unban') {
      const { error } = await supabase
        .from('users')
        .update({ is_banned: false })
        .eq('username', username);
      if (error) throw error;
      
    } else {
      return NextResponse.json({ success: false, error: 'Acción inválida' }, { status: 400 });
    }

    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
