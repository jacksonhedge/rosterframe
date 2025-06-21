import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD = 'GivingTheHands69!';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();
    
    if (password === ADMIN_PASSWORD) {
      // Create response with authentication cookie
      const response = NextResponse.json({ success: true });
      
      // Set secure, httpOnly cookie
      response.cookies.set('admin-authenticated', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      
      return response;
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  // Logout endpoint
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin-authenticated');
  return response;
}