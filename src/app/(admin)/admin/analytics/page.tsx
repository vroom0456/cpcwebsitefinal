import { getClubAnalytics, getMonthlyUploads } from "@/lib/services/analytics.service";
import { StatCard } from "@/components/admin/stat-card";
import { formatBytes } from "@/lib/utils";

export default async function AdminAnalyticsPage() {
  const [club, uploads] = await Promise.all([
    getClubAnalytics(),
    getMonthlyUploads().catch(() => []),
  ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-6 font-display text-2xl font-semibold">Analytics</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Total storage used" value={formatBytes(club?.storage_used_bytes ?? 0)} />
          <StatCard label="Monthly uploads" value={uploads.at(-1)?.count ?? 0} sublabel="This month" />
          <StatCard label="Total gallery views" value={club?.total_views ?? "—"} />
        </div>
      </div>
    </div>
  );
}
