import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Try before signup",
      icon: Zap,
      features: [
        "15 minutes of transcription per month",
        "5k chars translation quota",
        "1 job concurrency",
        "Basic audio upload (up to 20MB)",
        "Standard transcription accuracy",
        "Export to TXT format"
      ],
      cta: "Start Free",
      popular: false,
      priceId: null
    },
    {
      name: "Starter",
      price: "$9",
      period: "per month",
      description: "Students, solo creators",
      icon: Zap,
      features: [
        "120 minutes of transcription per month",
        "100k chars translation quota",
        "1 job concurrency",
        "Audio upload (up to 50MB)",
        "High accuracy transcription",
        "AI-powered translation",
        "Export to TXT, VTT, SRT formats",
        "Email support"
      ],
      cta: "Choose Starter",
      popular: false,
      priceId: "price_1SBLSPCxWYj2hyiwEbzGTdtK"
    },
    {
      name: "Pro",
      price: "$15",
      period: "per month",
      description: "Podcasters, coaches",
      icon: Crown,
      features: [
        "600 minutes of transcription per month",
        "500k chars translation quota",
        "2 jobs concurrency",
        "Large file uploads (up to 200MB)",
        "AI-powered translation to 100+ languages",
        "Batch processing",
        "Priority processing queue",
        "Export to TXT, VTT, SRT formats",
        "Searchable transcript history",
        "Advanced accuracy with timestamps",
        "Priority email support"
      ],
      cta: "Choose Pro",
      popular: true,
      priceId: "price_1SBLSpCxWYj2hyiw3rX9vNyT"
    },
    {
      name: "Business",
      price: "$39",
      period: "per month",
      description: "Teams, agencies",
      icon: Crown,
      features: [
        "3,000 minutes of transcription per month",
        "2M chars translation quota",
        "3 jobs concurrency",
        "Large file uploads (up to 500MB)",
        "AI-powered translation to 100+ languages",
        "Batch processing & bulk operations",
        "Priority processing queue",
        "Export to all formats",
        "Team collaboration features",
        "Advanced analytics",
        "API access",
        "Priority support with SLA"
      ],
      cta: "Choose Business",
      popular: false,
      priceId: "price_1SBLUgCxWYj2hyiwvCTj86oP"
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-primary text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Recommended Plans (USD)
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-6 ${
                  plan.popular
                    ? "bg-gradient-card border-2 border-primary shadow-brand scale-105"
                    : "bg-card border border-border hover-lift"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-hero text-white px-4 py-1 rounded-full text-xs font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`w-5 h-5 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-xs text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-2.5 h-2.5 text-primary" />
                      </div>
                      <span className="text-xs leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>

                <a 
                  href="/auth"
                  className={`inline-block w-full text-center px-6 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    plan.popular 
                      ? "bg-gradient-hero text-white shadow-brand hover:shadow-glow hover:scale-105 transition-all duration-300" 
                      : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All paid plans include priority support and full translation capabilities.
          </p>
          <p className="text-sm text-muted-foreground">
            <strong>Enterprise:</strong> Custom pricing with SSO, SLA, and regulated/large volume support. <a href="/contact" className="text-primary hover:underline">Contact us</a> for details.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;