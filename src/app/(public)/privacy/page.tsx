import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How CBIT Photo Club collects, uses, and protects information on this website.",
};

export default function PrivacyPolicyPage() {
  const effectiveDate = "11 October 2025";

  return (
    <main className="max-w-3xl mx-auto px-5 sm:px-8 py-20 sm:py-28 text-[#F8F5FB]">
      <div className="mb-10">
        <p className="text-xs font-mono uppercase tracking-widest text-white/40 mb-3">
          Legal
        </p>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-white/50">
          Effective date: {effectiveDate}
        </p>
      </div>

      <div className="prose prose-invert prose-sm sm:prose-base max-w-none space-y-8 text-white/75 leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-white mb-2">1. Who we are</h2>
          <p>
            CBIT Photo Club (&ldquo;CPC&rdquo;, &ldquo;we&rdquo;, &ldquo;us&rdquo;) is a student-run photography club
            at Chaitanya Bharathi Institute of Technology, Hyderabad, India. This
            website at <strong>cbitphotoclub.in</strong> serves as our public
            archive of event photography.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">2. Information we collect</h2>
          <p>We collect the minimum necessary to operate the site:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>Server logs</strong> — your IP address, browser type,
              referring URL, and pages visited. These logs are retained for up
              to 30 days for security and diagnostic purposes.
            </li>
            <li>
              <strong>Coverage request form</strong> — if you submit a coverage
              request, we collect your name, email address, event details, and
              any message you provide. This information is used only to respond
              to your request.
            </li>
            <li>
              <strong>Admin accounts</strong> — club members with admin access
              authenticate via a secure credential system. We store only the
              minimum session data required to maintain a logged-in state.
            </li>
          </ul>
          <p className="mt-3">
            We do not use cookies for tracking or advertising. We do not run
            analytics scripts, social media pixels, or third-party trackers.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">3. How we use your information</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>To respond to coverage enquiries sent through the contact form.</li>
            <li>To maintain site security and diagnose technical issues.</li>
            <li>To authenticate admin users and maintain their sessions.</li>
          </ul>
          <p className="mt-3">
            We do not sell, rent, or share your personal data with third parties
            for marketing or commercial purposes.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">4. Photography and image rights</h2>
          <p>
            All photographs published on this site were taken by CPC members at
            events on or affiliated with CBIT. By attending a CBIT event, you
            acknowledge that photography may occur and that images may be
            published on this site and our official Instagram.
          </p>
          <p className="mt-3">
            If you appear in a photograph and wish it to be removed, please
            contact us at{" "}
            <a
              href="mailto:photography_wbc@cbit.ac.in"
              className="text-white underline underline-offset-4"
            >
              photography_wbc@cbit.ac.in
            </a>
            . We will review and respond within 7 working days.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">5. Third-party services</h2>
          <p>This website uses the following third-party infrastructure:</p>
          <ul className="list-disc list-inside space-y-1 mt-2">
            <li>
              <strong>Vercel</strong> — hosting and deployment. Vercel may log
              request metadata as described in their{" "}
              <a
                href="https://vercel.com/legal/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white underline underline-offset-4"
              >
                Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Supabase</strong> — database and storage for event and
              photo metadata. Data is stored in a private Supabase project.
            </li>
            <li>
              <strong>Google Drive</strong> — original-resolution photographs
              are served from a private Google Drive folder owned and managed by
              CPC.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">6. Data retention</h2>
          <p>
            Coverage request messages are retained for as long as they are
            operationally relevant, and deleted upon request. Server logs are
            purged after 30 days. Admin session data is cleared on logout.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">7. Your rights</h2>
          <p>
            You have the right to access, correct, or request deletion of any
            personal information we hold about you. To exercise these rights,
            email{" "}
            <a
              href="mailto:photography_wbc@cbit.ac.in"
              className="text-white underline underline-offset-4"
            >
              photography_wbc@cbit.ac.in
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">8. Changes to this policy</h2>
          <p>
            If we make material changes to this policy, we will update the
            effective date at the top of this page. Continued use of the site
            after changes constitutes acceptance of the revised policy.
          </p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-white mb-2">9. Contact</h2>
          <p>
            Questions about this policy:{" "}
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
