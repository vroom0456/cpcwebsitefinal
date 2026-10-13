import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms and conditions governing use of the CBIT Photo Club website.",
};

export default function TermsPage() {
  const effectiveDate = "11 October 2025";

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-[#F8F5FB]">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Terms of Use
        </h1>
        <p className="text-sm text-white/50">
          Effective date: {effectiveDate}
        </p>
      </div>

      <div className="prose prose-invert prose-sm sm:prose-base max-w-none space-y-8 text-white/75 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-white mb-2">1. Acceptance</h2>
          <p>
            By accessing <strong>cbitphotoclub.in</strong> (&ldquo;the Site&rdquo;),
            you agree to these Terms of Use. If you do not agree, please stop
            using the Site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">2. About the Site</h2>
          <p>
            The Site is maintained by CBIT Photo Club (&ldquo;CPC&rdquo;), a
            student-run photography club at Chaitanya Bharathi Institute of
            Technology, Hyderabad, India. Its purpose is to publish and archive
            event photography taken by CPC members.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">3. Intellectual property</h2>
          <p>
            All photographs on this Site are the property of CBIT Photo Club
            and the individual photographers who took them. All rights are
            reserved.
          </p>
          <p className="mt-3">
            You may not reproduce, distribute, sell, or use any photograph from
            this Site for commercial purposes without prior written permission
            from CPC. Non-commercial sharing is permitted provided that clear
            credit is given to CBIT Photo Club.
          </p>
          <p className="mt-3">
            The CBIT Photo Club name, logo, and branding are the property of
            the club and may not be used without permission.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">4. Permitted use</h2>
          <p>You may use the Site to:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Browse and download photographs for personal, non-commercial use.</li>
            <li>Share photographs on social media with credit to CBIT Photo Club.</li>
            <li>Submit event coverage requests through the provided form.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">5. Prohibited use</h2>
          <p>You may not:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>Use photographs for commercial purposes without written permission.</li>
            <li>Remove, alter, or obscure any copyright or attribution notices.</li>
            <li>Use automated tools to scrape or bulk-download photographs from the Site.</li>
            <li>Attempt to gain unauthorised access to any part of the Site or its backend systems.</li>
            <li>Upload, post, or transmit any content that is unlawful, harmful, or offensive.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">6. Photography requests</h2>
          <p>
            Event coverage requests submitted via the Site are subject to CPC&rsquo;s
            capacity and discretion. Submission of a request does not guarantee
            coverage. CPC will endeavour to respond within a reasonable
            timeframe.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">7. Disclaimers</h2>
          <p>
            The Site is provided &ldquo;as is&rdquo; without warranties of any kind. CPC
            does not guarantee that the Site will be available at all times or
            that it will be free of errors or interruptions. CPC is not liable
            for any damages arising from your use of or inability to use the
            Site.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">8. Links to other sites</h2>
          <p>
            The Site may link to external websites (for example, Instagram or
            Google). CPC is not responsible for the content or privacy practices
            of those sites.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">9. Governing law</h2>
          <p>
            These Terms are governed by the laws of India. Any disputes shall
            be subject to the exclusive jurisdiction of courts in Hyderabad,
            Telangana.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">10. Changes to these Terms</h2>
          <p>
            CPC may update these Terms from time to time. The effective date at
            the top of this page will be updated when changes are made.
            Continued use of the Site after a change constitutes acceptance of
            the revised Terms.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">11. Contact</h2>
          <p>
            Questions about these Terms:{" "}
            <a
              href="mailto:photography_wbc@cbit.ac.in"
              className="text-white underline underline-offset-4"
            >
              photography_wbc@cbit.ac.in
            </a>
          </p>
        </section>
      </div>

      <div className="mt-14 pt-8 border-t border-white/[0.06]">
        <Link
          href="/"
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}
