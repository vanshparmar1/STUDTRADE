/** Applied to the listed item price for offline QR checkout (e.g. 0.05 = 5%). */
export const OFFLINE_PLATFORM_FEE_RATE = 0.05;

/**
 * @param {number} listedPrice - Seller’s listed price on the item
 * @returns {{ basePrice: number; platformFee: number; total: number }}
 */
export function computeOfflineBilling(listedPrice) {
  const base = Number(listedPrice);
  if (!Number.isFinite(base) || base < 0) {
    return { basePrice: 0, platformFee: 0, total: 0 };
  }
  const platformFee = Math.round(base * OFFLINE_PLATFORM_FEE_RATE * 100) / 100;
  const total = Math.round((base + platformFee) * 100) / 100;
  return { basePrice: base, platformFee, total };
}

/** When `online`, Buy Now uses Cashfree checkout. Otherwise show offline QR flow. */
export const isOnlineCashfreeCheckout = () =>
  import.meta.env.VITE_PAYMENT_MODE === 'online';

/** URL or path to QR image (e.g. `/offline-payment-qr.png` in `client/public/`). */
export const offlinePaymentQrSrc =
  import.meta.env.VITE_OFFLINE_PAYMENT_QR_SRC || '/offline-payment-qr.png';

/** E.164 or local digits; used for WhatsApp deep link (digits only). */
export const offlinePaymentPhone =
  import.meta.env.VITE_OFFLINE_PAYMENT_PHONE?.trim() || '';
