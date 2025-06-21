import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function getSupabaseClient() {
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase environment variables not configured');
  }
  return createClient(supabaseUrl, supabaseKey);
}

// Create plaques table if it doesn't exist
const createPlaquesTable = async (supabase: any) => {
  const { data, error } = await supabase.rpc('create_plaques_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS plaques (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('8-spot', '10-spot')),
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        stock_quantity INTEGER NOT NULL DEFAULT 0,
        image_url TEXT,
        dimensions VARCHAR(100),
        material VARCHAR(100) DEFAULT 'Acrylic',
        weight DECIMAL(5,2) DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_plaques_type ON plaques(type);
      CREATE INDEX IF NOT EXISTS idx_plaques_active ON plaques(active);
      CREATE INDEX IF NOT EXISTS idx_plaques_stock ON plaques(stock_quantity);
    `
  });

  if (error) {
    console.log('Table likely already exists or error:', error);
  }
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const typeFilter = searchParams.get('type') || 'all';
    const stockFilter = searchParams.get('stock') || 'all';
    
    const offset = (page - 1) * limit;

    // Try to create table first
    await createPlaquesTable(supabase);

    // Build query
    let query = supabase
      .from('plaques')
      .select('*', { count: 'exact' })
      .eq('active', true)
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter);
    }

    if (stockFilter !== 'all') {
      switch (stockFilter) {
        case 'out-of-stock':
          query = query.eq('stock_quantity', 0);
          break;
        case 'low-stock':
          query = query.gte('stock_quantity', 1).lte('stock_quantity', 5);
          break;
        case 'in-stock':
          query = query.gt('stock_quantity', 5);
          break;
      }
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: plaques, error, count } = await query;

    if (error) {
      console.error('Error fetching plaques:', error);
      return NextResponse.json(
        { error: 'Failed to fetch plaques', details: error },
        { status: 500 }
      );
    }

    // Calculate summary stats
    const totalValue = plaques?.reduce((sum: number, plaque: any) => 
      sum + (plaque.price * plaque.stock_quantity), 0) || 0;
    
    const lowStockCount = plaques?.filter((plaque: any) => 
      plaque.stock_quantity > 0 && plaque.stock_quantity <= 5).length || 0;

    return NextResponse.json({
      success: true,
      data: {
        plaques: plaques || [],
        total_count: count || 0,
        total_value: totalValue,
        low_stock_count: lowStockCount,
        page,
        limit,
        total_pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const {
      name,
      type,
      description,
      price,
      stock_quantity,
      image_url,
      dimensions,
      material,
      weight
    } = body;

    // Validate required fields
    if (!name || !type || !price) {
      return NextResponse.json(
        { error: 'Name, type, and price are required' },
        { status: 400 }
      );
    }

    // Validate type
    if (!['8-spot', '10-spot'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be either "8-spot" or "10-spot"' },
        { status: 400 }
      );
    }

    // Try to create table first
    await createPlaquesTable(supabase);

    const { data, error } = await supabase
      .from('plaques')
      .insert([{
        name,
        type,
        description: description || '',
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity) || 0,
        image_url: image_url || null,
        dimensions: dimensions || '',
        material: material || 'Acrylic',
        weight: parseFloat(weight) || 0,
        active: true
      }])
      .select()
      .single();

    if (error) {
      console.error('Error creating plaque:', error);
      return NextResponse.json(
        { error: 'Failed to create plaque', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const body = await request.json();

    const {
      id,
      name,
      type,
      description,
      price,
      stock_quantity,
      image_url,
      dimensions,
      material,
      weight,
      active
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Plaque ID is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('plaques')
      .update({
        name,
        type,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock_quantity),
        image_url,
        dimensions,
        material,
        weight: parseFloat(weight),
        active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating plaque:', error);
      return NextResponse.json(
        { error: 'Failed to update plaque', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Plaque ID is required' },
        { status: 400 }
      );
    }

    // Soft delete by setting active to false
    const { data, error } = await supabase
      .from('plaques')
      .update({ 
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting plaque:', error);
      return NextResponse.json(
        { error: 'Failed to delete plaque', details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 