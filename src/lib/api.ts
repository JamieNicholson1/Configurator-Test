import { VanOption } from '@/types/configurator';

// This is for client-side display only
const WOOCOMMERCE_PRODUCT_ID = process.env.NEXT_PUBLIC_WOOCOMMERCE_PRODUCT_ID || '123';

interface CheckoutPayload {
  productId: string | number;
  chassis: string;
  chassisName: string;
  components: Array<{
    id: string;
    name: string;
    price?: number;
  }>;
  totalPrice: number;
}

interface CheckoutResponse {
  success: boolean;
  orderId: number;
  checkoutUrl: string;
}

/**
 * Creates a WooCommerce order with the configurator data
 * Uses our proxy API route to avoid CORS issues
 */
export const createOrder = async (
  chassisId: string,
  chassisName: string,
  selectedComponents: VanOption[],
  totalPrice: number
): Promise<CheckoutResponse> => {
  try {
    const payload: CheckoutPayload = {
      productId: WOOCOMMERCE_PRODUCT_ID,
      chassis: chassisId,
      chassisName: chassisName,
      components: selectedComponents.map(component => ({
        id: component.id,
        name: component.name,
        price: component.price
      })),
      totalPrice: totalPrice
    };

    console.log('Sending order to proxy:', payload);

    // Use our proxy API route instead of WordPress directly
    const response = await fetch('/api/proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from proxy:', errorData);
      throw new Error(errorData.error || errorData.message || 'Failed to create order');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

/**
 * Redirects to the WooCommerce checkout page
 */
export const redirectToCheckout = (checkoutUrl: string): void => {
  window.location.href = checkoutUrl;
}; 