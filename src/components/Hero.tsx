import { Button } from "@/components/ui/button";
import { Play, Upload, Languages, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-waveform.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-hero opacity-90" />
      <div className="absolute inset-0 animated-gradient opacity-30" />
      
      {/* Hero Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImage} 
          alt="EchoFlow Audio Visualization" 
          className="w-full h-full object-cover opacity-40"
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-10">
        <div className="float-animation absolute top-20 left-10 w-3 h-16 bg-primary-glow/30 rounded-full waveform-bounce" style={{ animationDelay: '0s' }} />
        <div className="float-animation absolute top-32 left-20 w-2 h-12 bg-accent/40 rounded-full waveform-bounce" style={{ animationDelay: '0.5s' }} />
        <div className="float-animation absolute top-24 right-16 w-4 h-20 bg-primary-glow/25 rounded-full waveform-bounce" style={{ animationDelay: '1s' }} />
        <div className="float-animation absolute bottom-32 left-1/4 w-2 h-14 bg-accent/35 rounded-full waveform-bounce" style={{ animationDelay: '1.5s' }} />
        <div className="float-animation absolute bottom-20 right-1/3 w-3 h-18 bg-primary-glow/30 rounded-full waveform-bounce" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-6 text-center">
        <div className="animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-white/90 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Now with AI-powered translation
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Record or Upload.
            <br />
            <span className="bg-gradient-to-r from-primary-glow to-accent bg-clip-text text-transparent">
              Get transcripts & translations
            </span>
            <br />
            in seconds.
          </h1>
          
          <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
            EchoFlow transforms your audio into searchable transcripts and translates them into any language. 
            Perfect for interviews, meetings, lectures, and content creation.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button variant="hero" size="xl" className="group">
              <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
              Start Free Trial
            </Button>
            <Button variant="glass" size="xl">
              <Upload className="w-5 h-5 mr-2" />
              Try Demo
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-lift">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Play className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Record Live</h3>
              <p className="text-white/70">Real-time recording with instant waveform visualization</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-lift">
              <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Upload className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Upload Files</h3>
              <p className="text-white/70">Support for MP3, WAV, M4A, and video formats</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover-lift">
              <div className="w-12 h-12 bg-primary-glow/20 rounded-xl flex items-center justify-center mb-4 mx-auto">
                <Languages className="w-6 h-6 text-primary-glow" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Translate</h3>
              <p className="text-white/70">AI-powered translation to 100+ languages</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;