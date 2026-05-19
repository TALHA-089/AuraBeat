"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/lib/store/toastStore";
import {
  Activity,
  Check,
  Code,
  Copy,
  Key,
  Plus,
  Shield,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
};

type ApiPlatformClientProps = {
  keys: ApiKey[];
};

function formatDate(value: string | null) {
  if (!value) return "Never";
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ApiPlatformClient({ keys }: ApiPlatformClientProps) {
  const router = useRouter();
  const addToast = useToastStore((s) => s.addToast);
  const [localKeys, setLocalKeys] = useState(keys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeKeys = localKeys.filter((k) => k.is_active);

  async function handleCreateKey() {
    if (!newKeyName.trim()) {
      addToast({
        variant: "error",
        title: "Name required",
        message: "Please enter a name for your API key.",
      });
      return;
    }

    setCreating(true);

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        addToast({
          variant: "error",
          title: "Failed",
          message: data.error || "Could not create key.",
        });
        return;
      }

      setCreatedKey(data.key);
      addToast({
        variant: "success",
        title: "Key created",
        message: "Your new API key has been generated.",
      });
      router.refresh();
    } catch {
      addToast({
        variant: "error",
        title: "Error",
        message: "Something went wrong.",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteKey(keyId: string) {
    const confirmed = window.confirm("Deactivate this API key?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/keys?id=${keyId}`, { method: "DELETE" });
      if (!res.ok) {
        addToast({
          variant: "error",
          title: "Failed",
          message: "Could not deactivate key.",
        });
        return;
      }

      setLocalKeys((prev) =>
        prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)),
      );
      addToast({
        variant: "success",
        title: "Key deactivated",
        message: "The API key has been deactivated.",
      });
    } catch {
      addToast({
        variant: "error",
        title: "Error",
        message: "Something went wrong.",
      });
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    addToast({
      variant: "success",
      title: "Copied!",
      message: "API key copied to clipboard.",
    });
  }

  function closeModal() {
    setShowCreateModal(false);
    setNewKeyName("");
    setCreatedKey(null);
    setCopied(false);
    if (createdKey) router.refresh();
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 pb-20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Platform</h1>
            <p className="text-white/50 mt-1">
              Manage your API keys and integrate AuraBeat into your apps.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/50">Active Keys</span>
              <div className="w-10 h-10 rounded-lg bg-[#7C3AED]/10 flex items-center justify-center">
                <Key className="w-5 h-5 text-[#7C3AED]" />
              </div>
            </div>
            <div className="text-3xl font-bold">{activeKeys.length}</div>
            <p className="text-xs text-white/40 mt-1">API keys active</p>
          </div>

          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/50">Rate Limit</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-500" />
              </div>
            </div>
            <div className="text-3xl font-bold">100</div>
            <p className="text-xs text-white/40 mt-1">Requests / minute</p>
          </div>

          <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-white/50">Total Requests</span>
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold">0</div>
            <p className="text-xs text-white/40 mt-1">All time</p>
          </div>
        </div>

        {/* API Keys Table */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Your API Keys</h2>

          {localKeys.length === 0 ? (
            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-10 text-center">
              <Key className="w-10 h-10 text-white/20 mx-auto mb-4" />
              <h3 className="font-medium mb-1">No API keys yet</h3>
              <p className="text-sm text-white/50">
                Create your first key to start using the API.
              </p>
            </div>
          ) : (
            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl overflow-x-auto custom-scrollbar shadow-lg">
              <table className="w-full text-left min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-white/40 uppercase tracking-wider bg-[#111122]">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Key</th>
                    <th className="py-3 px-4">Created</th>
                    <th className="py-3 px-4">Last Used</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 w-16" />
                  </tr>
                </thead>
                <tbody>
                  {localKeys.map((key) => (
                    <tr
                      key={key.id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-medium">
                        {key.name}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/60 font-mono">
                        {key.prefix}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/50">
                        {formatDate(key.created_at)}
                      </td>
                      <td className="py-3 px-4 text-sm text-white/50">
                        {formatDate(key.last_used_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={[
                            "text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full",
                            key.is_active
                              ? "bg-emerald-500/15 text-emerald-400"
                              : "bg-red-500/15 text-red-400",
                          ].join(" ")}
                        >
                          {key.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {key.is_active && (
                          <button
                            type="button"
                            aria-label={`Deactivate key ${key.name}`}
                            onClick={() => handleDeleteKey(key.id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                            title="Deactivate"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Quick Start */}
        <section>
          <h2 className="text-xl font-semibold mb-4">Quick Start</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Code className="w-4 h-4 text-[#7C3AED]" />
                Generate Music
              </h3>
              <pre className="bg-[#0D0D1A] border border-white/5 rounded-lg p-4 text-xs text-white/80 overflow-x-auto custom-scrollbar">
                <code>{`curl -X POST https://api.aurabeat.ai/v1/generate \\
  -H "Authorization: Bearer sk_aura_..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Upbeat synthwave track",
    "style": "electronic",
    "instrumental": true
  }'`}</code>
              </pre>
            </div>

            <div className="bg-[#1A1A2E] border border-white/5 rounded-xl p-6 shadow-lg">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                Authentication
              </h3>
              <p className="text-sm text-white/60 mb-3">
                Include your API key in the{" "}
                <code className="bg-white/10 px-1 py-0.5 rounded text-xs">
                  Authorization
                </code>{" "}
                header as a Bearer token.
              </p>
              <div className="bg-[#0D0D1A] border border-white/5 rounded-lg p-4">
                <p className="text-xs text-white/50 mb-2">Endpoints</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded">
                      POST
                    </span>
                    <code className="text-white/70 text-xs">
                      /v1/generate
                    </code>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      GET
                    </span>
                    <code className="text-white/70 text-xs">/v1/tracks</code>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">
                      GET
                    </span>
                    <code className="text-white/70 text-xs">
                      /v1/tracks/:id
                    </code>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded">
                      PATCH
                    </span>
                    <code className="text-white/70 text-xs">
                      /v1/tracks/:id
                    </code>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                      DELETE
                    </span>
                    <code className="text-white/70 text-xs">
                      /v1/tracks/:id
                    </code>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                {createdKey ? "Key Created!" : "Create API Key"}
              </h3>
              <button
                type="button"
                onClick={closeModal}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {createdKey ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <Check className="w-4 h-4" />
                    Your API key has been created.
                  </div>

                  <div className="bg-[#0D0D1A] border border-white/10 rounded-lg p-4">
                    <p className="text-[10px] uppercase tracking-wider text-white/40 font-semibold mb-2">
                      Your API Key (shown once)
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 text-sm text-white font-mono break-all">
                        {createdKey}
                      </code>
                      <button
                        type="button"
                        onClick={() => handleCopy(createdKey)}
                        className="p-2 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-colors shrink-0"
                      >
                        {copied ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 text-xs text-yellow-200">
                    ⚠️ Save this key now. You won&apos;t be able to see it
                    again.
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/10"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white/80">
                      Key Name
                    </label>
                    <input
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. Production, Development"
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#7C3AED] transition-colors"
                      maxLength={100}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleCreateKey}
                    disabled={creating}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-[0_0_30px_-5px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50"
                  >
                    {creating ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" />
                        Generate Key
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
