import React, { useEffect } from 'react';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';

const RefundCancellation = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Refund & Cancellation Policy
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium">
            STUDTRADE - Digital Sanctuary for Students
          </p>
        </div>

        <div className="space-y-12 text-[var(--color-on-surface-variant)] leading-relaxed text-base">
          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔁</span> 1. RETURN POLICY
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
              <span className="text-xl">💸</span> 2. REFUND POLICY
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
              <span className="text-xl">❌</span> 3. CANCELLATION POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>Orders can be cancelled <strong>before dispatch</strong>.</li>
              <li>After shipment, cancellation depends on approval.</li>
              <li>Approved refunds are processed within <strong>3–5 working days</strong>.</li>
            </ul>
          </section>
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default RefundCancellation;
