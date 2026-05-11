import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Obtener todos los nombres de usuario únicos de los comentarios
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('user_name');

    if (commentsError) throw commentsError;

    // Obtener lista de baneados
    const { data: bannedData, error: bannedError } = await supabase
      .from('banned_users')
      .select('name');

    if (bannedError) {
      // Si la tabla no existe aún, evitamos que truene toda la app
      if (bannedError.code === '42P01') {
         return NextResponse.json({ success: true, users: [], banned: [] });
      }
      throw bannedError;
    }

    const uniqueUsers = new Set<string>();
    if (commentsData) {
      commentsData.forEach((row: any) => uniqueUsers.add(row.user_name));
    }

    const bannedList = bannedData ? bannedData.map((row: any) => row.name) : [];

    // Combinar: La lista total de usuarios conocidos incluye los que han comentado + los que están baneados
    bannedList.forEach((name: string) => uniqueUsers.add(name));

    const usersList = Array.from(uniqueUsers).map(name => ({
      name,
      isBanned: bannedList.includes(name)
    }));

    return NextResponse.json({ success: true, users: usersList, banned: bannedList });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, userName } = await req.json();

    if (!userName) {
      return NextResponse.json({ success: false, error: 'Missing userName' }, { status: 400 });
    }

    if (action === 'ban') {
      const { error } = await supabase
        .from('banned_users')
        .insert([{ name: userName }]);
      if (error) throw error;
    } else if (action === 'unban') {
      const { error } = await supabase
        .from('banned_users')
        .delete()
        .eq('name', userName);
      if (error) throw error;
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
