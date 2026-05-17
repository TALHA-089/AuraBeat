import { useState } from "react";
import { Check, Star } from "lucide-react";

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  const tiers = [
    {
      name: "Free",
      price: 0,
      gold: "50 Gold / Month",
      features: [
        "Standard quality downloads (MP3)",
        "Basic vocal models",
        "Public library access",
        "Standard generation speed",
      ]
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
      ]
    },
    {
      name: "Pro",
      price: annual ? 24 : 30,
      gold: "2,000 Gold / Month",
      features: [
        "Lossless downloads (FLAC)",
        "Custom voice cloning (1 slot)",
        "Stem separation tools",
        "Priority generation speed",
      ],
      popular: true
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
      ]
    },
    {
      name: "Enterprise",
      price: "Custom",
      gold: "Unlimited Gold",
      features: [
        "All Premier features",
        "Dedicated account manager",
        "Custom SLA & compliance",
        "White-label API solutions",
      ]
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-8 custom-scrollbar flex flex-col items-center">
      <div className="max-w-6xl w-full py-12">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight mb-4 text-white">Choose your rhythm</h1>
          <p className="text-white/50 text-lg mb-8 max-w-2xl mx-auto">
            Upgrade your plan to unlock more generation credits, advanced models, and high-resolution stem downloads.
          </p>

          <div className="inline-flex items-center gap-4 bg-[#1A1A2E] p-2 rounded-full border border-white/5">
            <span className={`text-sm font-medium ${!annual ? "text-white" : "text-white/50"}`}>Monthly</span>
            <button 
              onClick={() => setAnnual(!annual)}
              className={`w-14 h-7 rounded-full transition-colors relative ${annual ? "bg-[#7C3AED]" : "bg-white/10"}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-1 transition-transform ${annual ? "translate-x-8" : "translate-x-1"}`} />
            </button>
            <span className={`text-sm font-medium ${annual ? "text-white" : "text-white/50"} flex items-center gap-1.5`}>
              Annually <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Save 20%</span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {tiers.map((tier) => (
            <div 
              key={tier.name}
              className={`relative flex flex-col bg-[#1A1A2E] rounded-2xl border transition-transform hover:-translate-y-1 ${
                tier.popular 
                  ? "border-[#7C3AED] shadow-[0_0_30px_-10px_rgba(124,58,237,0.3)] scale-105 z-10" 
                  : "border-white/5 hover:border-white/20"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <span className="bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-6 border-b border-white/5">
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  {typeof tier.price === "number" ? (
                    <>
                      <span className="text-3xl font-bold">${tier.price}</span>
                      <span className="text-sm text-white/50">/ mo</span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold">{tier.price}</span>
                  )}
                </div>
                <div className="bg-[#0D0D1A] py-2 px-3 rounded-lg border border-white/5 text-center text-sm font-semibold text-yellow-500 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  {tier.gold}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <ul className="space-y-4 flex-1 mb-8">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/70">
                      <Check className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button 
                  className={`w-full py-2.5 rounded-lg text-sm font-bold transition-all ${
                    tier.popular
                      ? "bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white hover:shadow-[0_0_20px_-5px_rgba(124,58,237,0.5)]"
                      : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {tier.name === "Enterprise" ? "Contact Sales" : tier.name === "Free" ? "Current Plan" : "Upgrade"}
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
