import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import StitchNavbar from '../components/StitchNavbar';
import StitchFooter from '../components/StitchFooter';

const TermsPolicies = () => {
  const { hash } = useLocation();

  // Scroll to hash or top on mount/hash change
  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [hash]);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen">
      <StitchNavbar />

      <main className="pt-24 pb-20 max-w-4xl mx-auto px-6 md:px-12">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Terms & POLICIES
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium">
            STUDTRADE - Digital Sanctuary for Students
          </p>
        </div>

        <div className="space-y-12 text-[var(--color-on-surface-variant)] leading-relaxed text-base">
          
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🏢</span> 1. ABOUT STUDTRADE
            </h2>
            <p>
              <strong>StudTrade</strong> is a student-first marketplace designed to simplify buying and selling within college campuses.
            </p>
            <p>We operate as a <strong>secure and managed platform</strong>, where:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>All transactions are handled by StudTrade</li>
              <li>Buyer and seller identities are <strong>encrypted</strong></li>
              <li>No direct contact is allowed</li>
            </ul>
            <p>We aim to build a <strong>complete student ecosystem</strong>, including:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Resale marketplace</li>
              <li>New product promotions</li>
              <li>Mess services <em>(upcoming)</em></li>
              <li>Hostel rentals <em>(upcoming)</em></li>
            </ul>
            <p className="italic text-[var(--color-primary)]">👉 By students, for students.</p>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">💳</span> 2. PAYMENT, COMMISSION & DELIVERY CHARGES POLICY
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

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔐</span> 3. PLATFORM MODEL POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>StudTrade operates as a <strong>controlled intermediary</strong>.</li>
              <li>Buyer and seller identities are <strong>encrypted and confidential</strong>.</li>
              <li>No direct communication is allowed.</li>
              <li>All processes (listing, delivery, payment) are handled by StudTrade.</li>
            </ul>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🚚</span> 4. SHIPPING & DELIVERY POLICY
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

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔁</span> 5. RETURN POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Returns are allowed only if:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Product is damaged, defective, or not as described</li>
                  <li>Issue is reported within <strong>24 hours of delivery</strong></li>
                </ul>
              </li>
            </ul>
            
            <h3 className="text-lg font-bold text-[var(--color-on-surface)] mt-4">Return Process:</h3>
            <ol className="list-decimal pl-6 space-y-1">
              <li>Buyer raises request</li>
              <li>StudTrade verifies issue</li>
              <li>If approved → pickup arranged</li>
            </ol>
            <p className="mt-2 text-[var(--color-on-surface)] font-medium">• Item must be returned in original condition.</p>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">💸</span> 6. REFUND POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Refund is processed only after:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Successful return</li>
                  <li>Verification by StudTrade</li>
                </ul>
              </li>
              <li>If approved:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Refund is issued within <strong>48 hours</strong></li>
                </ul>
              </li>
              <li>If not reported within 24 hours:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Refund may not be applicable</li>
                </ul>
              </li>
            </ul>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">❌</span> 7. CANCELLATION POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders can be cancelled <strong>before dispatch</strong>.</li>
              <li>After shipment, cancellation depends on approval.</li>
              <li>Approved refunds are processed within <strong>3–5 working days</strong>.</li>
            </ul>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔒</span> 8. PRIVACY POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>User data is securely stored and protected.</li>
              <li>Data collected:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Name, contact details, college ID</li>
                </ul>
              </li>
              <li>Used only for:
                <ul className="list-circle pl-6 space-y-1 mt-1">
                  <li>Verification</li>
                  <li>Order processing</li>
                </ul>
              </li>
              <li>Buyer/seller identities remain <strong>confidential</strong>.</li>
              <li>No data is sold or shared externally.</li>
            </ul>
          </section>

          {/* Section 9 */}
          <section id="help" className="space-y-4 scroll-mt-24">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">📞</span> 9. CONTACT & SUPPORT POLICY
            </h2>
            <div className="bg-[var(--color-surface-container-low)] p-6 rounded-2xl space-y-3">
              <p>📧 Email: <a href="mailto:studtrade.help@gmail.com" className="text-[var(--color-primary)] font-bold hover:underline">studtrade.help@gmail.com</a></p>
              <p>📱 Phone: <strong className="text-[var(--color-on-surface)]">8058528664</strong>, <strong className="text-[var(--color-on-surface)]">7909793113</strong></p>
              <ul className="list-disc pl-6 mt-4 space-y-1">
                <li>Response time: within <strong>24 hours</strong></li>
                <li>Support includes:
                  <ul className="list-circle pl-6 space-y-1 mt-1">
                    <li>Orders</li>
                    <li>Returns</li>
                    <li>Delivery issues</li>
                  </ul>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">📑</span> 10. TERMS OF USE
            </h2>
            <p>By using StudTrade, you agree:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Only <strong>verified students</strong> can use the platform</li>
              <li>All transactions must go through StudTrade</li>
              <li>No illegal/prohibited items allowed</li>
              <li>Fraud or misuse leads to <strong>account suspension</strong></li>
            </ul>
            <p className="mt-4">StudTrade reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Approve/reject listings</li>
              <li>Cancel suspicious transactions</li>
            </ul>
          </section>

          {/* Section 11 */}
          <section className="space-y-4 pt-8">
            <div className="bg-[var(--color-secondary-container)]/30 border border-[var(--color-secondary)]/20 p-6 rounded-2xl w-full">
              <h2 className="text-xl font-bold text-[var(--color-on-surface)] flex items-center gap-2 mb-3">
                <span className="text-xl">⚠️</span> 11. DISCLAIMER
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-sm md:text-base">
                <li>StudTrade is a <strong>managed marketplace</strong>, not a direct seller.</li>
                <li>We facilitate secure transactions but do not manufacture products.</li>
                <li>Final usage responsibility lies with the buyer after delivery.</li>
              </ul>
            </div>
          </section>

        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default TermsPolicies;
