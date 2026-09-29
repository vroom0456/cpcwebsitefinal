import type { Metadata } from "next";
import { CoveragePageClient } from "@/components/public/coverage-page-client";

export const metadata: Metadata = {
  title: "Request Event Coverage | CBIT Photo Club",
  description:
    "Request official photography, videography, and media coverage for your CBIT college fests, technical events, workshops, cultural celebrations, and sports meets.",
  openGraph: {
    title: "Request Event Coverage | CBIT Photo Club",
    description:
      "Deploy the CBIT Photo Club media team for complete high-resolution photo coverage of your campus event.",
  },
};

export default function CoveragePage() {
  return <CoveragePageClient />;
}
