import { MemberForm } from "@/components/admin/member-form";
import { requireAdmin } from "@/lib/auth/require-admin";

export default async function NewMemberPage() {
  await requireAdmin();

  return (
    <div>
      <h1 className="mb-6 font-display text-2xl font-semibold">New member</h1>
      <MemberForm submitLabel="Add member" />
    </div>
  );
}
