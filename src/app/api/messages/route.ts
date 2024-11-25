import { getUserData } from '@/actions/get-user-data';
import { supabaseServerClient } from '@/supabase/supabaseServer';
import { NextResponse } from 'next/server';

function getPagination(page: number = 0, size: number = 10) {
  const limit = Math.max(1, size); // Ensure a minimum limit of 1
  const from = page * limit;
  const to = from + limit - 1;

  return { from, to };
}

export async function GET(req: Request) {
  try {
    // Supabase client and user data
    const supabase = await supabaseServerClient();
    const userData = await getUserData();
    if (!userData) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const channelId = searchParams.get('channelId');
    const page = Number(searchParams.get('page')) || 0;
    const size = Number(searchParams.get('size')) || 10;

    if (!channelId) {
      return NextResponse.json({ message: 'Channel ID is required' }, { status: 400 });
    }

    if (isNaN(page) || isNaN(size) || page < 0 || size <= 0) {
      return NextResponse.json(
        { message: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Pagination range
    const { from, to } = getPagination(page, size);

    // Fetch messages
    const { data, error } = await supabase
      .from('messages')
      .select('*, user: user_id (id, name, avatar_url)') // Adjust to fetch only required user fields
      .eq('channel_id', channelId)
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET MESSAGES ERROR: ', error);
      return NextResponse.json(
        { message: 'Failed to fetch messages', error },
        { status: 400 }
      );
    }

    // Success response
    return NextResponse.json({ data });
  } catch (error) {
    console.error('SERVER ERROR: ', error);
    return NextResponse.json(
      { message: 'Internal server error', error },
      { status: 500 }
    );
  }
}
