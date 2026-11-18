import { redirect } from "next/navigation";

export default async function AdminLayout() {
  const adminStudioUrl =
    process.env.NEXT_PUBLIC_ADMIN_STUDIO_URL ||
    "https://admincpcwebsitefinal.vercel.app/login";
  redirect(adminStudioUrl);
}
