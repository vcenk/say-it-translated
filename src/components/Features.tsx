import { Mic, Upload, Languages, Search, Download, Clock, Shield, Zap } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Mic,
      title: "Live Recording",
      description: "Record directly from your microphone with real-time waveform visualization and instant feedback.",
      color: "text-audio-recording"
    },
    {
      icon: Upload,
      title: "File Upload",
      description: "Drag and drop audio or video files. Supports MP3, WAV, M4A, MP4, and more formats.",
      color: "text-primary"
    },
    {
      icon: Languages,
      title: "AI Translation",
      description: "Translate transcripts to 100+ languages using advanced AI with context-aware accuracy.",
      color: "text-accent"
    },
    {
      icon: Search,
      title: "Smart Search",
      description: "Find specific moments in your transcripts with powerful search and timestamp navigation.",
      color: "text-audio-processing"
    },
    {
      icon: Download,
      title: "Multiple Formats",
      description: "Export transcripts as TXT, VTT, or SRT files with or without timestamps.",
      color: "text-primary"
    },
    {
      icon: Clock,
      title: "Timestamp Precision",
      description: "Get word-level timing accuracy for precise video subtitles and audio navigation.",
      color: "text-accent"
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your audio files are encrypted and stored securely. Delete anytime, we don't share data.",
      color: "text-audio-wave"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Advanced processing pipeline delivers transcriptions in seconds, not minutes.",
      color: "text-audio-recording"
    }
  ];

  return (
    <section id="features" className="py-24 bg-background">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-accent/10 rounded-full px-4 py-2 text-accent text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            Powerful features
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need for
            <br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              audio transcription
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From recording to translation, EchoFlow provides professional-grade tools 
            for all your transcription needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group bg-card rounded-2xl p-6 border border-border hover-lift hover:shadow-brand transition-all duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4">
                  <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gradient-card rounded-3xl p-8 border border-border">
            <h3 className="text-2xl font-bold mb-4">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Join thousands of professionals who trust EchoFlow for their transcription needs.
              Start with 15 minutes free, no credit card required.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;