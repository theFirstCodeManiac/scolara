// Paystack integration utility for Hub group payments
// One-time ₦500 fee per group

const PAYSTACK_PUBLIC_KEY = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || '';

export interface PaystackConfig {
  email: string;
  amount: number; // in kobo (₦500 = 50000 kobo)
  reference: string;
  metadata?: Record<string, unknown>;
  onSuccess: (reference: string) => void;
  onClose: () => void;
}

// Generate a unique payment reference
export const generatePaystackReference = (userId: string, groupId: string): string => {
  const timestamp = Date.now();
  return `SCOLARA_HUB_${userId.slice(0, 8)}_${groupId.slice(0, 8)}_${timestamp}`;
};

// Load Paystack inline script dynamically
const loadPaystackScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(script);
  });
};

// Initiate Paystack popup
export const initiatePaystackPayment = async (config: PaystackConfig): Promise<void> => {
  await loadPaystackScript();

  const handler = window.PaystackPop.setup({
    key: PAYSTACK_PUBLIC_KEY,
    email: config.email,
    amount: config.amount,
    ref: config.reference,
    currency: 'NGN',
    metadata: config.metadata || {},
    callback: (response: { reference: string }) => {
      config.onSuccess(response.reference);
    },
    onClose: () => {
      config.onClose();
    },
  });

  handler.openIframe();
};

// Hub group join fee
export const HUB_JOIN_FEE_NAIRA = 500;
export const HUB_JOIN_FEE_KOBO = HUB_JOIN_FEE_NAIRA * 100;

// Declare global PaystackPop type
declare global {
  interface Window {
    PaystackPop: {
      setup: (config: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}
