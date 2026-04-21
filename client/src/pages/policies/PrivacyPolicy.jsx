import React, { useEffect } from 'react';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium">
            STUDTRADE - Digital Sanctuary for Students
          </p>
        </div>

        <div className="space-y-12 text-[var(--color-on-surface-variant)] leading-relaxed text-base">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">🔒</span> PRIVACY COMMITMENT
            </h2>
            <ul className="list-disc pl-6 space-y-2">
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
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default PrivacyPolicy;
