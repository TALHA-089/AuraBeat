"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/lib/store/toastStore";
import {
  Activity,
  CheckCircle2,
  Coins,
  Edit,
  Key,
  Music,
  Server,
  Shield,
  Trash2,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";

type AdminStats = {
  totalUsers: number;
  totalTracks: number;
  totalGold: number;
  activeApiKeys: number;
};

type UserRow = {
  id: string;
  display_name: string | null;
  gold_balance: number | null;
  plan: string | null;
  is_admin: boolean | null;
  created_at: string | null;
};

type TrackRow = {
  id: string;
  title: string | null;
  user_id: string;
  style_tags: string[] | null;
  created_at: string | null;
};

type AdminClientProps = {
  stats: AdminStats;
  users: UserRow[];
  tracks: TrackRow[];
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatusDot({ ok }: { ok: boolean }) {
  return ok ? (
    <div className="flex items-center gap-2 text-emerald-400">
      <CheckCircle2 className="w-4 h-4" />
      <span className="text-sm">Online</span>
    </div>
  ) : (
    <div className="flex items-center gap-2 text-red-400">
      <XCircle className="w-4 h-4" />
      <span className="text-sm">Offline</span>
    </div>
  );
}

export function AdminClient({ stats, users: initialUsers, tracks: initialTracks }: AdminClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);

  const [users, setUsers] = useState(initialUsers);
  const [tracks, setTracks] = useState(initialTracks);

  // Edit User State
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editGold, setEditGold] = useState(0);
  const [editIsAdmin, setEditIsAdmin] = useState(false);
  const [isSavingUser, setIsSavingUser] = useState(false);

  function openEditModal(user: UserRow) {
    setEditingUser(user);
    setEditPlan(user.plan || "free");
    setEditGold(user.gold_balance ?? 0);
    setEditIsAdmin(user.is_admin ?? false);
  }

  function closeEditModal() {
    setEditingUser(null);
  }

  async function handleSaveUser() {
    if (!editingUser) return;
    setIsSavingUser(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editingUser.id,
          plan: editPlan,
          gold_balance: editGold,
          is_admin: editIsAdmin,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update user");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                plan: editPlan,
                gold_balance: editGold,
                is_admin: editIsAdmin,
              }
            : u
        )
      );

      addToast({
        variant: "success",
        title: "User Updated",
        message: "Profile has been successfully updated.",
      });
      
      closeEditModal();
      router.refresh();
    } catch {
      addToast({
        variant: "error",
        title: "Update Failed",
        message: "Could not update user profile. Check RLS policies.",
      });
    } finally {
      setIsSavingUser(false);
    }
  }

  async function handleDeleteTrack(trackId: string) {
    const confirmed = window.confirm("Are you sure you want to delete this track? This action cannot be undone.");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/tracks?id=${trackId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete track");
      }

      setTracks((prev) => prev.filter((t) => t.id !== trackId));
      
      addToast({
        variant: "success",
        title: "Track Deleted",
        message: "The track has been permanently removed.",
      });
      router.refresh();
    } catch {
      addToast({
        variant: "error",
        title: "Delete Failed",
        message: "Could not delete track. Check RLS policies.",
      });
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-[#7C3AED]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/50 text-sm mt-0.5">
              Platform overview and management
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={stats.totalUsers}
            icon={<Users className="w-5 h-5 text-blue-500" />}
            iconBg="bg-blue-500/10"
          />
          <StatCard
            label="Total Tracks"
            value={stats.totalTracks}
            icon={<Music className="w-5 h-5 text-[#7C3AED]" />}
            iconBg="bg-[#7C3AED]/10"
          />
          <StatCard
            label="Gold Distributed"
            value={stats.totalGold.toLocaleString()}
            icon={<Coins className="w-5 h-5 text-yellow-500" />}
            iconBg="bg-yellow-500/10"
          />
          <StatCard
            label="Active API Keys"
            value={stats.activeApiKeys}
            icon={<Key className="w-5 h-5 text-emerald-500" />}
            iconBg="bg-emerald-500/10"
          />
        </div>

        {/* System Health */}
        <section>
          <h2 className="text-xl font-semibold mb-4">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/70">
                  Supabase
                </span>
                <Server className="w-4 h-4 text-white/30" />
              </div>
              <StatusDot ok={true} />
              <p className="text-xs text-white/40 mt-2">
                Auth, Database, Storage
              </p>
            </div>

            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/70">
                  AI Server (Gradio)
                </span>
                <Activity className="w-4 h-4 text-white/30" />
              </div>
              <StatusDot ok={false} />
              <p className="text-xs text-white/40 mt-2">
                Ephemeral Colab endpoint
              </p>
            </div>

            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white/70">
                  Vercel
                </span>
                <TrendingUp className="w-4 h-4 text-white/30" />
              </div>
              <StatusDot ok={true} />
              <p className="text-xs text-white/40 mt-2">
                Frontend deployment
              </p>
            </div>
          </div>
        </section>

        {/* Recent Users */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Users</h2>
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-x-auto custom-scrollbar shadow-lg">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider bg-[#111122]">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Plan</th>
                  <th className="py-3 px-4">Gold</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#7C3AED]/20 flex items-center justify-center text-xs font-bold text-[#7C3AED]">
                          {(u.display_name ?? "U").charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-medium">
                          {u.display_name || "Anonymous"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-xs capitalize bg-white/5 px-2 py-1 rounded-md">
                        {u.plan || "free"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-yellow-500">
                      {u.gold_balance ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      {u.is_admin ? (
                        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#7C3AED]/20 text-[#7C3AED] px-2 py-1 rounded-full">
                          Admin
                        </span>
                      ) : (
                        <span className="text-xs text-white/40">User</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openEditModal(u)}
                        aria-label={`Edit user ${u.display_name}`}
                        className="p-1.5 rounded-lg hover:bg-[#7C3AED]/20 text-white/40 hover:text-[#7C3AED] transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent Tracks */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Recent Tracks</h2>
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-x-auto custom-scrollbar shadow-lg">
            <table className="w-full text-left min-w-[600px]">
              <thead>
                <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider bg-[#111122]">
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">User ID</th>
                  <th className="py-3 px-4">Style</th>
                  <th className="py-3 px-4">Created</th>
                  <th className="py-3 px-4 w-16" />
                </tr>
              </thead>
              <tbody>
                {tracks.map((t) => (
                  <tr
                    key={t.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3 px-4 text-sm font-medium">
                      {t.title?.trim() || "Untitled"}
                    </td>
                    <td className="py-3 px-4 text-xs text-white/40 font-mono">
                      {t.user_id.slice(0, 8)}...
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        {(t.style_tags ?? []).slice(0, 2).map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-white/50">
                      {formatDate(t.created_at)}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteTrack(t.id)}
                        aria-label={`Delete track ${t.title}`}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                        title="Delete Track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Edit User Profile</h3>
              <button
                onClick={closeEditModal}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center font-bold text-[#7C3AED]">
                  {(editingUser.display_name ?? "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-sm">{editingUser.display_name || "Anonymous"}</div>
                  <div className="text-xs text-white/40 font-mono">{editingUser.id}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Plan
                </label>
                <select
                  value={editPlan}
                  onChange={(e) => setEditPlan(e.target.value)}
                  className="w-full bg-[#0D0D1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
                >
                  <option value="Free">Free</option>
                  <option value="Basic">Basic</option>
                  <option value="Pro">Pro</option>
                  <option value="Premier">Premier</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white/80">
                  Gold Balance
                </label>
                <input
                  type="number"
                  value={editGold}
                  onChange={(e) => setEditGold(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0D0D1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={editIsAdmin}
                      onChange={(e) => setEditIsAdmin(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${editIsAdmin ? "bg-[#7C3AED]" : "bg-white/10 group-hover:bg-white/20"}`} />
                    <div className={`absolute left-1 top-1 w-4 h-4 rounded-full bg-white transition-transform ${editIsAdmin ? "translate-x-4" : ""}`} />
                  </div>
                  <span className="text-sm font-medium text-white/80">Admin Privileges</span>
                </label>
                <p className="text-[10px] text-white/40 mt-1 ml-13">Grant this user full access to the Admin Dashboard.</p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  onClick={closeEditModal}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUser}
                  disabled={isSavingUser}
                  className="flex-1 flex justify-center items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white py-3 rounded-xl text-sm font-semibold shadow-lg hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50"
                >
                  {isSavingUser ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  ) : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  iconBg,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
}) {
  return (
    <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-white/50 font-medium">{label}</span>
        <div
          className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
