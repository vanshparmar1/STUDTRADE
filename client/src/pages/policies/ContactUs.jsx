import React, { useEffect } from 'react';
import StitchNavbar from '../../components/StitchNavbar';
import StitchFooter from '../../components/StitchFooter';

const ContactUs = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <div className="bg-[var(--color-surface)] text-[var(--color-on-surface)] min-h-screen flex flex-col">
      <StitchNavbar />

      <main className="flex-1 pt-24 pb-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="space-y-4 mb-12 border-b border-[var(--color-surface-variant)] pb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[var(--color-on-surface)] tracking-tight">
            Contact Us
          </h1>
          <p className="text-lg text-[var(--color-on-surface-variant)] font-medium">
            STUDTRADE - Digital Sanctuary for Students
          </p>
        </div>

        <div className="space-y-12 text-[var(--color-on-surface-variant)] leading-relaxed text-base">
          {/* Section 9 */}
          <section id="help" className="space-y-4">
            <h2 className="text-2xl font-bold text-[var(--color-on-surface)] flex items-center gap-2">
              <span className="text-xl">📞</span> CONTACT & SUPPORT POLICY
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
        </div>
      </main>

      <StitchFooter />
    </div>
  );
};

export default ContactUs;
