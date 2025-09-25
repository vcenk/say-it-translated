import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const FAQ = () => {
  const faqs = [
    {
      question: "How accurate is the transcription?",
      answer: "EchoFlow uses Deepgram's advanced speech recognition technology, achieving over 95% accuracy on clear audio. Accuracy depends on audio quality, speaker clarity, and background noise levels."
    },
    {
      question: "What audio formats are supported?",
      answer: "We support all major audio and video formats including MP3, WAV, M4A, WEBM, MP4, and more. Maximum file size is 20MB for free users and 200MB for Pro users."
    },
    {
      question: "How does the translation feature work?",
      answer: "Our AI-powered translation uses advanced language models to provide context-aware translations to over 100 languages. Translation is available for Pro users and maintains formatting and punctuation."
    },
    {
      question: "Is my audio data secure?",
      answer: "Yes, absolutely. All audio files are encrypted in transit and at rest. We never share your data with third parties, and you can delete your files anytime. Audio processing is handled securely in the cloud."
    },
    {
      question: "Can I use EchoFlow for video files?",
      answer: "Yes! EchoFlow can extract and transcribe audio from video files. Upload MP4, WEBM, or other video formats and we'll process the audio track for transcription."
    },
    {
      question: "Do you offer refunds?",
      answer: "Yes, we offer a 30-day money-back guarantee for Pro subscriptions. If you're not satisfied with EchoFlow, contact our support team for a full refund."
    },
    {
      question: "Can I export transcripts with timestamps?",
      answer: "Pro users can export transcripts in multiple formats including TXT (plain text), VTT (WebVTT with timestamps), and SRT (SubRip for subtitles). Free users get TXT export only."
    },
    {
      question: "Is there an API available?",
      answer: "API access is coming soon for Pro users. You'll be able to integrate EchoFlow's transcription and translation capabilities directly into your applications."
    }
  ];

  return (
    <section id="faq" className="py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 text-primary text-sm font-medium mb-6">
            <HelpCircle className="w-4 h-4" />
            Frequently asked questions
          </div>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Got Questions?
          </h2>
          <p className="text-xl text-muted-foreground">
            Find answers to common questions about EchoFlow's features and pricing.
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-card rounded-2xl border border-border px-6"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            Still have questions? We're here to help.
          </p>
          <a 
            href="mailto:support@echoflow.ai" 
            className="text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Contact Support →
          </a>
        </div>
      </div>
    </section>
  );
};

export default FAQ;