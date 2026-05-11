import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: commentsData, error } = await supabase
      .from('comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Supabase GET comments error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Estructurar como comments[businessUnit][period][component_id] = [ { text, user_name, created_at, id } ]
    const comments: Record<string, any> = {};

    if (commentsData) {
      commentsData.forEach((row: any) => {
        const { business_unit, period, component_id, text, user_name, created_at, id } = row;

        if (!comments[business_unit]) comments[business_unit] = {};
        if (!comments[business_unit][period]) comments[business_unit][period] = {};
        if (!comments[business_unit][period][component_id]) comments[business_unit][period][component_id] = [];

        comments[business_unit][period][component_id].push({
          id,
          text,
          user_name,
          created_at
        });
      });
    }

    return NextResponse.json({ success: true, comments });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { businessUnit, period, id, text, userName } = await req.json();

    if (!businessUnit || !period || !id || !text || !userName) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('comments')
      .insert([
        {
          business_unit: businessUnit,
          period: period,
          component_id: id,
          text: text,
          user_name: userName
        }
      ]);

    if (error) {
      console.error("Supabase POST comment error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Retornamos todos los comments actualizados igual que en el GET
    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
