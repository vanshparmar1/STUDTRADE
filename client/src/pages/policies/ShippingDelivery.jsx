import React, { useEffect } from 'react';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';

const ShippingDelivery = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Shipping & Delivery Policy
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium">
            STUDTRADE - Digital Sanctuary for Students
          </p>
        </div>

        <div className="space-y-12 text-[var(--color-on-surface-variant)] leading-relaxed text-base">
          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">💳</span> 1. PAYMENT, COMMISSION & DELIVERY CHARGES POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Buyers must <strong>pay the full amount before delivery</strong> (except selected COD cases).</li>
              <li>StudTrade securely holds the payment until successful delivery.</li>
              <li>Sellers receive payment within <strong>24 hours after delivery confirmation</strong>.</li>
            </ul>
            
            <h3 className="text-lg font-bold text-[var(--color-on-surface)] mt-4">💰 Commission Structure:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>12% commission charged from sellers</strong></li>
              <li><strong>4% platform fee charged from buyers</strong></li>
            </ul>

            <h3 className="text-lg font-bold text-[var(--color-on-surface)] mt-4">🚚 Delivery Charges:</h3>
            <ul className="list-disc pl-6 space-y-1">
              <li>A <strong>standard delivery charge</strong> is applied on each order.</li>
              <li>Delivery charges may vary depending on:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Distance within campus</li>
                  <li>Item size/weight</li>
                </ul>
              </li>
              <li>Final delivery fee is <strong>clearly shown at checkout before payment</strong>.</li>
            </ul>

            <p className="mt-4">These charges support:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Logistics & pickup</li>
              <li>Verification process</li>
              <li>Platform operations</li>
              <li>Customer support</li>
            </ul>
            <div className="bg-[var(--color-error-container)]/20 text-[var(--color-error)] border border-[var(--color-error)]/20 p-4 rounded-xl mt-4 font-medium">
              ⚠️ All payments must be made through StudTrade. Direct transactions are strictly prohibited.
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🚚</span> 2. SHIPPING & DELIVERY POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders are processed within <strong>48 hours of confirmation</strong>.</li>
              <li>Buyers receive confirmation via <strong>email or phone call</strong>.</li>
              <li>After confirmation:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Logistics partner contacts seller</li>
                  <li>Product is verified</li>
                  <li>Pickup is arranged</li>
                </ul>
              </li>
              <li>Delivery is completed within campus or designated zones.</li>
              <li><strong>Open-box delivery</strong> is provided to ensure correct product delivery.</li>
              <li><strong>Cash on Delivery (COD)</strong> may be available in selected cases.</li>
            </ul>
          </section>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default ShippingDelivery;
