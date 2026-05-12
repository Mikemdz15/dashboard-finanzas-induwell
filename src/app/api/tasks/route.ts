import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: tasksData, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      if (error.code === '42P01') {
        // Table doesn't exist yet
        return NextResponse.json({ success: true, tasks: {} });
      }
      throw error;
    }

    // Structure tasks similar to comments: tasks[businessUnit][period][component_id] = [ { id, text, assignee, created_by, completed, created_at } ]
    const tasks: Record<string, any> = {};

    if (tasksData) {
      tasksData.forEach((row: any) => {
        const { business_unit, period, component_id, text, assignee, created_by, completed, created_at, id } = row;

        if (!tasks[business_unit]) tasks[business_unit] = {};
        if (!tasks[business_unit][period]) tasks[business_unit][period] = {};
        if (!tasks[business_unit][period][component_id]) tasks[business_unit][period][component_id] = [];

        tasks[business_unit][period][component_id].push({
          id,
          text,
          assignee,
          created_by,
          completed,
          created_at
        });
      });
    }

    return NextResponse.json({ success: true, tasks, rawTasks: tasksData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { businessUnit, period, id, text, assignee, createdBy } = await req.json();

    if (!businessUnit || !period || !id || !text || !assignee || !createdBy) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .insert([
        {
          business_unit: businessUnit,
          period: period,
          component_id: id,
          text: text,
          assignee: assignee,
          created_by: createdBy
        }
      ]);

    if (error) throw error;

    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, completed } = await req.json();

    if (!id || typeof completed !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .update({ completed })
      .eq('id', id);

    if (error) throw error;

    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing task id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return await GET();
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
