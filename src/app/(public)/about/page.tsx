import { Metadata } from "next";
import { AboutPageClient } from "@/components/public/about-page-client";

export const metadata: Metadata = {
  title: "About Us · CBIT Photo Club",
  description: "The official photography community of Chaitanya Bharathi Institute of Technology, Hyderabad. Preserving memories and visual storytelling since 2014.",
};

export default function AboutPage() {
  return <AboutPageClient />;
}
