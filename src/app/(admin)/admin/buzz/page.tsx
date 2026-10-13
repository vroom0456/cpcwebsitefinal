import { getDashboardUser } from "@/lib/auth/require-admin";
import { getBuzzSubmissions } from "@/lib/actions/buzz.actions";
import { AdminBuzzClient } from "@/components/admin/admin-buzz-client";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Buzz Submissions",
};

export default async function AdminBuzzPage() {
  const { isAdmin } = await getDashboardUser();
  const submissions = await getBuzzSubmissions();

  return <AdminBuzzClient initialSubmissions={submissions} isAdmin={isAdmin} />;
}
