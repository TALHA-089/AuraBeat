"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Code,
  Eye,
  EyeOff,
  Gauge,
  Lock,
  Mail,
  Save,
  Settings,
  Sliders,
  Volume2,
  Zap,
  Music,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/store/toastStore";

type UserProfile = {
  id: string;
  display_name: string | null;
  email: string;
  gold_balance: number | null;
  plan: string | null;
  created_at: string | null;
  is_admin: boolean | null;
};

type SettingsClientProps = {
  profile: UserProfile;
};

type SettingTab = 
  | "account"
  | "subscription"
  | "audio"
  | "ai-generation"
  | "editor"
  | "notifications"
  | "api"
  | "privacy"
  | "app";

export function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [activeTab, setActiveTab] = useState<SettingTab>("account");
  const [isSaving, setIsSaving] = useState(false);

  // Account Settings
  const [displayName, setDisplayName] = useState(profile.display_name ?? "");

  // Audio & Music Preferences
  const [defaultAudioFormat, setDefaultAudioFormat] = useState<"mp3" | "wav" | "flac">("wav");
  const [audioQuality, setAudioQuality] = useState<"standard" | "high" | "lossless">("high");
  const [autoDownload, setAutoDownload] = useState(false);

  // AI Generation Settings
  const [defaultVoiceStyle, setDefaultVoiceStyle] = useState<"natural" | "expressive" | "robotic">("natural");
  const [generationSpeed, setGenerationSpeed] = useState<"balanced" | "fast" | "quality">("balanced");
  const [autoSaveGenerations, setAutoSaveGenerations] = useState(true);

  // Editor Preferences
  const [waveformZoom, setWaveformZoom] = useState(50);
  const [autoSaveInterval, setAutoSaveInterval] = useState(5);
  const [showGridLines, setShowGridLines] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);

  // Notifications
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [generationComplete, setGenerationComplete] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [newFeatures, setNewFeatures] = useState(true);

  // Privacy & Security
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profilePublic, setProfilePublic] = useState(false);
  const [allowAnalytics, setAllowAnalytics] = useState(true);
  const [showEmail, setShowEmail] = useState(false);

  // App Preferences
  const [theme, setTheme] = useState<"dark" | "light" | "auto">("dark");
  const [language, setLanguage] = useState<"en" | "es" | "fr" | "de">("en");
  const [compactMode, setCompactMode] = useState(false);

  // API Settings (for admins)
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [rateLimitPerMinute, setRateLimitPerMinute] = useState(60);
  const [allowWebhooks, setAllowWebhooks] = useState(false);

  async function handleSaveSettings() {
    setIsSaving(true);

    try {
      const supabase = createClient();

      // Update display name if changed
      if (displayName !== profile.display_name) {
        const { error } = await supabase
          .from("profiles")
          .update({ display_name: displayName })
          .eq("id", profile.id);

        if (error) throw new Error(error.message);
      }

      addToast({
        variant: "success",
        title: "Settings Saved",
        message: "Your preferences have been updated successfully.",
      });

      router.refresh();
    } catch (error) {
      addToast({
        variant: "error",
        title: "Error Saving Settings",
        message: error instanceof Error ? error.message : "Could not save settings.",
      });
    } finally {
      setIsSaving(false);
    }
  }

  const tabs: Array<{ id: SettingTab; label: string; icon: React.ReactNode }> = [
    { id: "account", label: "Account", icon: <Settings className="w-4 h-4" /> },
    { id: "subscription", label: "Subscription & Credits", icon: <Zap className="w-4 h-4" /> },
    { id: "audio", label: "Audio & Music", icon: <Volume2 className="w-4 h-4" /> },
    { id: "ai-generation", label: "AI Generation", icon: <Gauge className="w-4 h-4" /> },
    { id: "editor", label: "Editor", icon: <Sliders className="w-4 h-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
    ...(profile.is_admin ? [{ id: "api", label: "API Settings", icon: <Code className="w-4 h-4" /> }] : []),
    { id: "privacy", label: "Privacy & Security", icon: <Lock className="w-4 h-4" /> },
    { id: "app", label: "App Preferences", icon: <Music className="w-4 h-4" /> },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your account preferences and application settings.
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-white/5 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-[#7C3AED] text-white"
                    : "border-transparent text-white/50 hover:text-white/80",
                ].join(" ")}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Account Settings */}
          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Account Information</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:border-[#7C3AED] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white/50 disabled:cursor-not-allowed"
                    />
                    <p className="mt-1 text-xs text-white/40">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Current Plan
                    </label>
                    <input
                      type="text"
                      value={profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Free"}
                      disabled
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white/50 disabled:cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Gold Balance
                    </label>
                    <input
                      type="text"
                      value={(profile.gold_balance ?? 0).toLocaleString()}
                      disabled
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-yellow-500 disabled:cursor-not-allowed font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Member Since
                    </label>
                    <input
                      type="text"
                      value={profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—"}
                      disabled
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white/50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subscription & Credits */}
          {activeTab === "subscription" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Subscription & Credits</h2>

                <div className="space-y-4">
                  <div className="bg-[#0D0D1A] rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-white/70 mb-2">Current Plan</p>
                    <p className="text-2xl font-bold text-[#7C3AED]">
                      {profile.plan ? profile.plan.charAt(0).toUpperCase() + profile.plan.slice(1) : "Free"}
                    </p>
                  </div>

                  <div className="bg-[#0D0D1A] rounded-lg p-4 border border-white/5">
                    <p className="text-sm text-white/70 mb-2">Gold Balance</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {(profile.gold_balance ?? 0).toLocaleString()}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <a
                      href="/subscription-billing"
                      className="inline-block px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white font-semibold hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all"
                    >
                      Manage Subscription
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audio & Music Preferences */}
          {activeTab === "audio" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Audio & Music Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Default Download Format
                    </label>
                    <select
                      value={defaultAudioFormat}
                      onChange={(e) => setDefaultAudioFormat(e.target.value as "mp3" | "wav" | "flac")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="mp3">MP3 (Standard Compression)</option>
                      <option value="wav">WAV (High Quality)</option>
                      <option value="flac">FLAC (Lossless)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Default Audio Quality
                    </label>
                    <select
                      value={audioQuality}
                      onChange={(e) => setAudioQuality(e.target.value as "standard" | "high" | "lossless")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="standard">Standard (128 kbps)</option>
                      <option value="high">High (320 kbps)</option>
                      <option value="lossless">Lossless (FLAC)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Auto-Download Generated Tracks</span>
                    <button
                      onClick={() => setAutoDownload(!autoDownload)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        autoDownload ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          autoDownload ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Generation Settings */}
          {activeTab === "ai-generation" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">AI Generation Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Default Voice Style
                    </label>
                    <select
                      value={defaultVoiceStyle}
                      onChange={(e) => setDefaultVoiceStyle(e.target.value as "natural" | "expressive" | "robotic")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="natural">Natural</option>
                      <option value="expressive">Expressive</option>
                      <option value="robotic">Robotic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Generation Speed
                    </label>
                    <select
                      value={generationSpeed}
                      onChange={(e) => setGenerationSpeed(e.target.value as "balanced" | "fast" | "quality")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="fast">Fast (Uses More Gold)</option>
                      <option value="balanced">Balanced</option>
                      <option value="quality">Quality (Slower)</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Auto-Save Generations</span>
                    <button
                      onClick={() => setAutoSaveGenerations(!autoSaveGenerations)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        autoSaveGenerations ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          autoSaveGenerations ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Editor Preferences */}
          {activeTab === "editor" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Editor Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Waveform Zoom Level: {waveformZoom}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="200"
                      value={waveformZoom}
                      onChange={(e) => setWaveformZoom(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Auto-Save Interval (minutes)
                    </label>
                    <select
                      value={autoSaveInterval}
                      onChange={(e) => setAutoSaveInterval(Number(e.target.value))}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value={1}>1 minute</option>
                      <option value={5}>5 minutes</option>
                      <option value={10}>10 minutes</option>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Show Grid Lines</span>
                    <button
                      onClick={() => setShowGridLines(!showGridLines)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        showGridLines ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          showGridLines ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Snap to Grid</span>
                    <button
                      onClick={() => setSnapToGrid(!snapToGrid)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        snapToGrid ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          snapToGrid ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {activeTab === "notifications" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Notification Preferences</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Email Notifications</span>
                    <button
                      onClick={() => setEmailNotifications(!emailNotifications)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        emailNotifications ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          emailNotifications ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Generation Complete</span>
                    <button
                      onClick={() => setGenerationComplete(!generationComplete)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        generationComplete ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          generationComplete ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Weekly Digest</span>
                    <button
                      onClick={() => setWeeklyDigest(!weeklyDigest)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        weeklyDigest ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          weeklyDigest ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">New Features & Updates</span>
                    <button
                      onClick={() => setNewFeatures(!newFeatures)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        newFeatures ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          newFeatures ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* API Settings (Developer-only) */}
          {activeTab === "api" && profile.is_admin && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">API Settings</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Your API Key
                    </label>
                    <div className="flex gap-2">
                      <input
                        type={apiKeyVisible ? "text" : "password"}
                        value={apiKeyVisible ? "••••••••••••••••••••••••" : "••••••••••••••••••••••••"}
                        disabled
                        className="flex-1 bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white disabled:cursor-not-allowed font-mono text-sm"
                      />
                      <button
                        onClick={() => setApiKeyVisible(!apiKeyVisible)}
                        className="px-4 py-2.5 bg-[#0D0D1A] border border-white/10 rounded-lg text-white hover:bg-white/5 transition-colors"
                      >
                        {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-white/40">API key is securely stored and cannot be displayed for security reasons</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Rate Limit (requests per minute)
                    </label>
                    <select
                      value={rateLimitPerMinute}
                      onChange={(e) => setRateLimitPerMinute(Number(e.target.value))}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value={30}>30 requests/min</option>
                      <option value={60}>60 requests/min</option>
                      <option value={120}>120 requests/min</option>
                      <option value={300}>300 requests/min</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Allow Webhooks</span>
                    <button
                      onClick={() => setAllowWebhooks(!allowWebhooks)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        allowWebhooks ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          allowWebhooks ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Privacy & Security */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">Privacy & Security</h2>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Two-Factor Authentication</span>
                    <button
                      onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        twoFactorEnabled ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          twoFactorEnabled ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Public Profile</span>
                    <button
                      onClick={() => setProfilePublic(!profilePublic)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        profilePublic ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          profilePublic ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Allow Analytics</span>
                    <button
                      onClick={() => setAllowAnalytics(!allowAnalytics)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        allowAnalytics ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          allowAnalytics ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Show Email in Profile</span>
                    <button
                      onClick={() => setShowEmail(!showEmail)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        showEmail ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          showEmail ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="pt-4 border-t border-white/5 mt-4">
                    <button className="px-4 py-2.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors border border-red-500/30 font-medium text-sm">
                      Change Password
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* App Preferences */}
          {activeTab === "app" && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6">
                <h2 className="text-lg font-semibold mb-6">App Preferences</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Theme
                    </label>
                    <select
                      value={theme}
                      onChange={(e) => setTheme(e.target.value as "dark" | "light" | "auto")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="dark">Dark (Default)</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto (System)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white/80 mb-2">
                      Language
                    </label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value as "en" | "es" | "fr" | "de")}
                      className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#7C3AED] focus:outline-none"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                      <option value="de">Deutsch</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-[#0D0D1A] rounded-lg border border-white/5">
                    <span className="text-sm font-medium text-white/80">Compact Mode</span>
                    <button
                      onClick={() => setCompactMode(!compactMode)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        compactMode ? "bg-[#7C3AED]" : "bg-white/10"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                          compactMode ? "translate-x-8" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="flex gap-3 sticky bottom-8 bg-[#0D0D1A] p-4 rounded-lg border border-white/5 justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white font-semibold hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
