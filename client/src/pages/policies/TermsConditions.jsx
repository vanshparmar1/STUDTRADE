import React, { useEffect } from 'react';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';

const TermsConditions = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Terms & Conditions
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

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔐</span> 2. PLATFORM MODEL POLICY
            </h2>
            <ul className="list-disc pl-6 space-y-1">
              <li>StudTrade operates as a <strong>controlled intermediary</strong>.</li>
              <li>Buyer and seller identities are <strong>encrypted and confidential</strong>.</li>
              <li>No direct communication is allowed.</li>
              <li>All processes (listing, delivery, payment) are handled by StudTrade.</li>
            </ul>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">📑</span> 3. TERMS OF USE
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
                <span className="text-xl">⚠️</span> 4. DISCLAIMER
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

export default TermsConditions;
