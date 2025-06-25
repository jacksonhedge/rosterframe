'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const paymentIntent = searchParams.get('payment_intent');
  const redirectStatus = searchParams.get('redirect_status');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!paymentIntent) {
        setError('No payment information found');
        setLoading(false);
        return;
      }

      try {
        if (!supabase) {
          setError('Database not configured');
          setLoading(false);
          return;
        }
        const { data, error: fetchError } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntent)
          .single();

        if (fetchError) {
          console.error('Error fetching order:', fetchError);
          setError('Could not find your order');
        } else {
          setOrder(data);
        }
      } catch (err) {
        console.error('Error:', err);
        setError('An error occurred while loading your order');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentIntent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">Loading your order...</p>
        </div>
      </div>
    );
  }

  if (error || redirectStatus !== 'succeeded') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error || 'Your payment could not be processed.'}</p>
          <Link href="/build-and-buy" className="bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-700 transition">
            Try Again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-3xl font-black text-amber-900 mb-3">Order Confirmed!</h1>
          <p className="text-lg text-amber-700 mb-6">Thank you for your purchase</p>
          
          <div className="bg-green-50 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-semibold text-lg">
              Order Number: {order?.order_number || 'Loading...'}
            </p>
          </div>

          <p className="text-gray-600">
            We&apos;ve sent a confirmation email to <span className="font-semibold">{order?.customer_email}</span>
          </p>
        </div>

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-6">Order Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Plaque Type</span>
                <span className="font-semibold capitalize">{order.plaque_type}</span>
              </div>
              
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Team Name</span>
                <span className="font-semibold">{order.league_data?.teamName || 'Your Team'}</span>
              </div>
              
              {order.gift_packaging && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Gift Packaging</span>
                  <span className="font-semibold text-green-600">🎁 Included</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 border-b border-gray-200">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${order.subtotal?.toFixed(2)}</span>
              </div>
              
              {order.discount_amount > 0 && (
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="text-gray-600">Discount</span>
                  <span className="font-semibold text-green-600">-${order.discount_amount?.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between py-3 text-lg">
                <span className="font-bold">Total Paid</span>
                <span className="font-bold text-amber-600">${order.total_amount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-amber-900 mb-6">What Happens Next?</h2>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="bg-amber-100 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">✅</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Order Received</h3>
                <p className="text-gray-600">Your order has been received and payment confirmed.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">🎨</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Design & Production</h3>
                <p className="text-gray-600">Our team will create your custom plaque with your selected players.</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">📦</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Shipping</h3>
                <p className="text-gray-600">
                  Your plaque will be carefully packaged and shipped within 7-10 business days.
                  {order?.metadata?.is_pre_order === 'true' && (
                    <span className="block text-blue-600 font-semibold mt-1">
                      Pre-order: Expected delivery in March 2025
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="bg-gray-100 rounded-full p-3 flex-shrink-0">
                <span className="text-2xl">🚚</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Delivery</h3>
                <p className="text-gray-600">You&apos;ll receive tracking information once your order ships.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="text-center space-y-4">
          <Link 
            href="/build-and-buy" 
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-amber-700 transition"
          >
            Create Another Plaque
          </Link>
          
          <div className="text-gray-600">
            <p>Questions about your order?</p>
            <p>Contact us at <a href="mailto:support@rosterframe.com" className="text-amber-600 hover:underline">support@rosterframe.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-amber-600 mx-auto mb-4"></div>
          <p className="text-lg text-amber-800">Loading...</p>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}