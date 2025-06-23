import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Log to verify env vars are loaded (remove in production)
console.log('Supabase URL:', supabaseUrl);
console.log('Service key exists:', !!supabaseServiceKey);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Get or create a session ID for anonymous users
function getSessionId() {
  const cookieStore = cookies();
  let sessionId = cookieStore.get('engraving_session_id')?.value;
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
  }
  
  return sessionId;
}

// GET - Fetch saved engraving configurations
export async function GET(request: Request) {
  try {
    const sessionId = getSessionId();
    
    const { data, error } = await supabase
      .from('engraving_configurations')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching engravings:', error);
      return NextResponse.json({ error: 'Failed to fetch engravings' }, { status: 500 });
    }

    const response = NextResponse.json({ engravings: data || [] });
    
    // Set session cookie if it's new
    response.cookies.set('engraving_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error in GET /api/engravings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save a new engraving configuration
export async function POST(request: Request) {
  try {
    const sessionId = getSessionId();
    const body = await request.json();
    
    console.log('Saving engraving with sessionId:', sessionId);
    console.log('Request body:', body);

    const insertData = {
      session_id: sessionId,
      text: body.text,
      font_id: body.fontId,
      font_name: body.fontName,
      font_size: body.fontSize,
      position_x: body.positionX,
      position_y: body.positionY,
      material_id: body.materialId,
      material_name: body.materialName,
      plaque_size: body.plaqueSize || 'medium',
    };
    
    console.log('Insert data:', insertData);

    const { data, error } = await supabase
      .from('engraving_configurations')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json({ 
        error: 'Failed to save engraving', 
        details: error.message,
        hint: error.hint 
      }, { status: 500 });
    }

    const response = NextResponse.json({ engraving: data });
    
    // Set session cookie
    response.cookies.set('engraving_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/engravings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Delete an engraving configuration
export async function DELETE(request: Request) {
  try {
    const sessionId = getSessionId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('engraving_configurations')
      .delete()
      .eq('id', id)
      .eq('session_id', sessionId);

    if (error) {
      console.error('Error deleting engraving:', error);
      return NextResponse.json({ error: 'Failed to delete engraving' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/engravings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}