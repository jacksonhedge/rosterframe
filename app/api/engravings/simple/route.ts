import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Simple in-memory storage for testing
// In production, this would be in a database
const engravings = new Map<string, any[]>();

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
    const userEngravings = engravings.get(sessionId) || [];
    
    const response = NextResponse.json({ engravings: userEngravings });
    
    // Set session cookie if it's new
    response.cookies.set('engraving_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error in GET /api/engravings/simple:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save a new engraving configuration
export async function POST(request: Request) {
  try {
    const sessionId = getSessionId();
    const body = await request.json();
    
    const newEngraving = {
      id: crypto.randomUUID(),
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
      created_at: new Date().toISOString(),
    };
    
    // Get existing engravings or create new array
    const userEngravings = engravings.get(sessionId) || [];
    userEngravings.unshift(newEngraving);
    
    // Keep only last 20 engravings
    if (userEngravings.length > 20) {
      userEngravings.splice(20);
    }
    
    engravings.set(sessionId, userEngravings);

    const response = NextResponse.json({ engraving: newEngraving });
    
    // Set session cookie
    response.cookies.set('engraving_session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });

    return response;
  } catch (error) {
    console.error('Error in POST /api/engravings/simple:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}