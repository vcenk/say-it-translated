import { Button } from "@/components/ui/button";
import { Check, Zap, Crown } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      description: "Perfect for getting started",
      icon: Zap,
      features: [
        "15 minutes of transcription per month",
        "Basic audio upload (up to 20MB)",
        "Standard transcription accuracy",
        "Export to TXT format",
        "Email support"
      ],
      limitations: [
        "No translation features",
        "No batch processing",
        "Queue priority: standard"
      ],
      cta: "Start Free",
      popular: false
    },
    {
      name: "Pro",
      price: "$19",
      period: "per month",
      description: "For professionals and teams",
      icon: Crown,
      features: [
        "600 minutes of transcription per month",
        "Large file uploads (up to 200MB)",
        "AI-powered translation to 100+ languages",
        "Batch translate multiple languages",
        "Priority processing queue",
        "Export to TXT, VTT, SRT formats",
        "Searchable transcript history",
        "Advanced accuracy with timestamps",
        "Priority email support",
        "API access (coming soon)"
      ],
      cta: "Upgrade to Pro",
      popular: true
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-primary text-sm font-medium mb-6">
            <Crown className="w-4 h-4" />
            Simple, transparent pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Start free, upgrade when you need more. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl p-8 ${
                  plan.popular
                    ? "bg-gradient-card border-2 border-primary shadow-brand scale-105"
                    : "bg-card border border-border hover-lift"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-hero text-white px-6 py-2 rounded-full text-sm font-semibold">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    plan.popular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`w-6 h-6 ${plan.popular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{plan.name}</h3>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>

                <div className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                  
                  {plan.limitations && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2 font-medium">Limitations:</p>
                      {plan.limitations.map((limitation, limitIndex) => (
                        <div key={limitIndex} className="flex items-start gap-3 mb-2">
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center mt-0.5">
                            <span className="w-2 h-2 bg-muted-foreground rounded-full" />
                          </div>
                          <span className="text-xs text-muted-foreground">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  variant={plan.popular ? "hero" : "outline"} 
                  className="w-full"
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground">
            Need more minutes? Contact us for enterprise pricing.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Pricing;