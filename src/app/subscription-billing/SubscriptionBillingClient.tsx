"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Star, X, AlertCircle, Check, Coins } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToastStore } from "@/lib/store/toastStore";

type SubscriptionProfile = {
  id: string;
  plan: string | null;
  gold_balance: number | null;
};

type SubscriptionBillingClientProps = {
  profile: SubscriptionProfile;
};

function normalizePlan(plan: string | null) {
  return plan?.trim() || "free";
}

export function SubscriptionBillingClient({ profile }: SubscriptionBillingClientProps) {
  const router = useRouter();
  const addToast = useToastStore((state) => state.addToast);
  const [annual, setAnnual] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentPlan = useMemo(
    () => normalizePlan(profile.plan),
    [profile.plan],
  );

  const tiers = useMemo(
    () => [
      {
        name: "Free",
        price: 0,
        gold: "50 Gold / Month",
        features: [
          "Standard quality downloads (MP3)",
          "Basic vocal models",
          "Public library access",
          "Standard generation speed",
        ],
      },
      {
        name: "Basic",
        price: annual ? 8 : 10,
        gold: "500 Gold / Month",
        features: [
          "High quality downloads (WAV)",
          "Advanced vocal models",
          "Private library access",
          "Fast generation speed",
        ],
      },
      {
        name: "Pro",
        price: annual ? 24 : 30,
        gold: "2,000 Gold / Month",
        popular: true,
        features: [
          "Lossless downloads (FLAC)",
          "Custom voice cloning (1 slot)",
          "Stem separation tools",
          "Priority generation speed",
        ],
      },
      {
        name: "Premier",
        price: annual ? 64 : 80,
        gold: "10,000 Gold / Month",
        features: [
          "All Pro features",
          "Custom voice cloning (5 slots)",
          "Full API Access",
          "Commercial use license",
        ],
      },
      {
        name: "Enterprise",
        price: "Custom" as const,
        gold: "Unlimited Gold",
        features: [
          "All Premier features",
          "Dedicated account manager",
          "Custom SLA & compliance",
          "White-label API solutions",
        ],
      },
    ],
    [annual],
  );

  async function handlePayment() {
    if (!selectedPlan) return;

    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const supabase = createClient();

      // Map plans to their monthly gold amounts
      const goldAmountByPlan: Record<string, number> = {
        free: 50,
        basic: 500,
        pro: 2000,
        premier: 10000,
        enterprise: 999999,
      };

      const selectedPlanKey = selectedPlan.toLowerCase();
      const goldAmount = goldAmountByPlan[selectedPlanKey] || 0;

      // Update user plan and gold balance in database
      const { error } = await supabase
        .from("profiles")
        .update({
          plan: selectedPlan,
          gold_balance: goldAmount,
        })
        .eq("id", profile.id);

      if (error) {
        throw new Error(error.message);
      }

      addToast({
        variant: "success",
        title: "Subscription Updated",
        message: `You've successfully upgraded to ${selectedPlan} plan! You now have ${goldAmount === 999999 ? "unlimited" : goldAmount} Gold.`,
      });

      setShowPaymentModal(false);
      setSelectedPlan(null);
      router.refresh();
    } catch (error) {
      addToast({
        variant: "error",
        title: "Payment failed",
        message:
          error instanceof Error
            ? error.message
            : "Could not process payment.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  function handleUpgradeClick(tierName: string) {
    if (tierName.toLowerCase() !== currentPlan.toLowerCase()) {
      setSelectedPlan(tierName);
      setShowPaymentModal(true);
    }
  }

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subscription & Billing</h1>
          <p className="mt-1 text-sm text-white/50">
            Manage your AuraBeat subscription plan and billing information.
          </p>
        </div>

        {/* Current Plan Card */}
        <section className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold capitalize">
                Current Plan: <span className="text-[#7C3AED]">{currentPlan}</span>
              </h2>
              <p className="mt-2 text-sm text-white/50">
                You have{" "}
                <span className="text-yellow-500 font-semibold">
                  {profile.gold_balance || 0} Gold
                </span>{" "}
                available
              </p>
            </div>
            <Coins className="w-8 h-8 text-yellow-500" />
          </div>
        </section>

        {/* Plans Section */}
        <section>
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold tracking-tight mb-2">
              Choose your rhythm
            </h2>
            <p className="text-white/50 max-w-xl mx-auto mb-6">
              Upgrade your plan to unlock more generation credits, advanced
              models, and high-resolution stem downloads.
            </p>

            {/* Annual / Monthly toggle */}
            <div className="inline-flex items-center gap-4 bg-[#1A1A2E] p-2 rounded-full border border-white/5">
              <span
                className={`text-sm font-medium ${
                  !annual ? "text-white" : "text-white/50"
                }`}
              >
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setAnnual(!annual)}
                className={`w-14 h-7 rounded-full transition-colors relative ${
                  annual ? "bg-[#7C3AED]" : "bg-white/10"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${
                    annual ? "translate-x-8" : "translate-x-1"
                  }`}
                />
              </button>
              <span
                className={`text-sm font-medium flex items-center gap-1.5 ${
                  annual ? "text-white" : "text-white/50"
                }`}
              >
                Annually
                <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">
                  Save 20%
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {tiers.map((tier) => {
              const isCurrent =
                tier.name.toLowerCase() === currentPlan.toLowerCase();

              return (
                <div
                  key={tier.name}
                  className={[
                    "relative flex flex-col bg-[#1A1A2E] rounded-2xl border transition-transform hover:-translate-y-1",
                    tier.popular
                      ? "border-[#7C3AED] shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] scale-105 z-10"
                      : "border-white/5 hover:border-white/20",
                  ].join(" ")}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-0 right-0 flex justify-center">
                      <span className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3 fill-white" /> Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-5 border-b border-white/5">
                    <h3 className="text-lg font-bold mb-2">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-3">
                      {typeof tier.price === "number" ? (
                        <>
                          <span className="text-2xl font-bold">
                            ${tier.price}
                          </span>
                          <span className="text-xs text-white/50">/ mo</span>
                        </>
                      ) : (
                        <span className="text-2xl font-bold">
                          {tier.price}
                        </span>
                      )}
                    </div>
                    <div className="bg-[#0D0D1A] py-1.5 px-2 rounded-lg border border-white/5 text-center text-xs font-semibold text-yellow-500 flex items-center justify-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                      {tier.gold}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1 mb-6">
                      {tier.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-xs text-white/70"
                        >
                          <Check className="w-3.5 h-3.5 text-[#7C3AED] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      type="button"
                      onClick={() => handleUpgradeClick(tier.name)}
                      disabled={
                        isCurrent ||
                        tier.name === "Enterprise" ||
                        isProcessing
                      }
                      className={[
                        "w-full py-2.5 rounded-lg text-sm font-bold transition-all disabled:cursor-not-allowed",
                        isCurrent
                          ? "bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/30"
                          : tier.popular
                            ? "bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] cursor-pointer"
                            : "bg-white/5 text-white hover:bg-white/10 border border-white/10 cursor-pointer",
                      ].join(" ")}
                    >
                      {isCurrent
                        ? "Current Plan"
                        : tier.name === "Enterprise"
                          ? "Contact Sales"
                          : "Upgrade"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-center mt-6 text-xs text-white/40">
            Upgrade your plan to unlock premium features. Payment is processed securely.
          </p>
        </section>

        {/* Billing History Section */}
        <section className="rounded-2xl border border-white/5 bg-[#1A1A2E] p-6 shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Billing History</h2>
          <div className="text-center py-8">
            <p className="text-white/50">No billing history available yet</p>
          </div>
        </section>

        {/* Payment Modal */}
        {showPaymentModal && selectedPlan && (
          <PaymentModal
            planName={selectedPlan}
            planPrice={
              tiers.find((t) => t.name === selectedPlan)?.price || 0
            }
            annual={annual}
            onConfirm={handlePayment}
            onCancel={() => {
              setShowPaymentModal(false);
              setSelectedPlan(null);
            }}
            isProcessing={isProcessing}
          />
        )}
      </div>
    </div>
  );
}

// Payment Modal Component
interface PaymentModalProps {
  planName: string;
  planPrice: number | string;
  annual: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isProcessing: boolean;
}

function PaymentModal({
  planName,
  planPrice,
  annual,
  onConfirm,
  onCancel,
  isProcessing,
}: PaymentModalProps) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardName, setCardName] = useState("");

  const formattedPrice =
    typeof planPrice === "number" ? `$${planPrice.toFixed(2)}` : planPrice;
  const billingPeriod = annual ? "year" : "month";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1A2E] rounded-2xl border border-white/10 max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] p-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            Upgrade to {planName}
          </h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="text-white/70 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Price Summary */}
          <div className="bg-[#0D0D1A] rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70">Price</span>
              <span className="text-white font-semibold">
                {formattedPrice} / {billingPeriod}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-white/70">Status</span>
              <span className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 text-xs px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3" />
                Ready to Subscribe
              </span>
            </div>
          </div>

          {/* Payment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#7C3AED] focus:outline-none"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white/80 mb-2">
                Card Number
              </label>
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\s/g, "");
                  if (val.length <= 16 && /^\d*$/.test(val)) {
                    const formatted = val
                      .replace(/(\d{4})/g, "$1 ")
                      .trim();
                    setCardNumber(formatted);
                  }
                }}
                placeholder="1234 5678 9012 3456"
                className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#7C3AED] focus:outline-none font-mono"
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  Expiry Date
                </label>
                <input
                  type="text"
                  value={expiryDate}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 4) {
                      const formatted =
                        val.length >= 2 ? `${val.slice(0, 2)}/${val.slice(2)}` : val;
                      setExpiryDate(formatted);
                    }
                  }}
                  placeholder="MM/YY"
                  className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#7C3AED] focus:outline-none"
                  disabled={isProcessing}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white/80 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  value={cvv}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    if (val.length <= 3) {
                      setCvv(val);
                    }
                  }}
                  placeholder="123"
                  className="w-full bg-[#0D0D1A] border border-white/10 rounded-lg px-3 py-2 text-white placeholder-white/30 focus:border-[#7C3AED] focus:outline-none"
                  disabled={isProcessing}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-200">
                Your payment information is secured with encryption and will not
                be stored on our servers.
              </p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={
                isProcessing ||
                !cardNumber ||
                !expiryDate ||
                !cvv ||
                !cardName
              }
              className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white font-semibold hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : (
                `Pay ${formattedPrice}`
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
