import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, FileAudio, Globe, Download, Play, Pause, Mic, History, Settings, User, LogOut, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Navigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Recording {
  id: string;
  original_filename: string;
  status: string;
  created_at: string;
  duration_sec?: number;
  size_bytes?: number;
}

interface Transcript {
  id: string;
  text: string;
  confidence: number;
  language_detected: string;
  created_at: string;
}

interface Translation {
  id: string;
  target_lang: string;
  text: string;
  created_at: string;
}

const App = () => {
  const { user, loading, signOut } = useAuth();
  const { toast } = useToast();
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [transcript, setTranscript] = useState<Transcript | null>(null);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [uploading, setUploading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (user) {
      fetchRecordings();
    }
  }, [user]);

  const fetchRecordings = async () => {
    try {
      const { data, error } = await supabase
        .from('recordings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecordings(data || []);
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch recordings",
        variant: "destructive",
      });
    }
  };

  const fetchTranscript = async (recordingId: string) => {
    try {
      const { data, error } = await supabase
        .from('transcripts')
        .select('*')
        .eq('recording_id', recordingId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          throw error;
        }
        setTranscript(null);
        return;
      }
      
      setTranscript(data);
      fetchTranslations(data.id);
    } catch (error) {
      console.error('Error fetching transcript:', error);
    }
  };

  const fetchTranslations = async (transcriptId: string) => {
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('transcript_id', transcriptId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error fetching translations:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/m4a', 'audio/webm'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an audio file (MP3, WAV, MP4, M4A, or WebM)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (200MB max for Pro tier, adjust based on subscription)
    const maxSize = 200 * 1024 * 1024; // 200MB
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "File must be smaller than 200MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      // Create recording record first
      const { data: recordingData, error: recordingError } = await supabase
        .from('recordings')
        .insert({
          original_filename: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          status: 'uploading',
          source: 'upload'
        })
        .select()
        .single();

      if (recordingError) throw recordingError;

      // Upload file to Supabase Storage
      const filePath = `${user?.id}/${recordingData.id}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Update recording with storage path
      const { error: updateError } = await supabase
        .from('recordings')
        .update({ 
          storage_path: filePath,
          status: 'queued'
        })
        .eq('id', recordingData.id);

      if (updateError) throw updateError;

      toast({
        title: "Upload successful",
        description: "File uploaded successfully. Ready for transcription.",
      });

      fetchRecordings();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleTranscribe = async (recording: Recording) => {
    setTranscribing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: { recordingId: recording.id }
      });

      if (error) throw error;

      toast({
        title: "Transcription started",
        description: "Your audio is being transcribed. This may take a few minutes.",
      });

      // Refresh recordings and fetch transcript
      fetchRecordings();
      setTimeout(() => fetchTranscript(recording.id), 2000);
    } catch (error) {
      console.error('Transcription error:', error);
      toast({
        title: "Transcription failed",
        description: "Failed to start transcription. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 44100,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      });
      
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: 'audio/webm' });
        await handleRecordedAudio(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      setRecordingTime(0);
      
      // Start recording timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      setRecordingInterval(interval);
      
      recorder.start(1000); // Collect data every second
      setRecording(true);
      
      toast({
        title: "Recording started",
        description: "Speak into your microphone. Click stop when finished.",
      });
      
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording failed",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      setRecording(false);
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      
      toast({
        title: "Recording stopped",
        description: "Processing your audio for transcription...",
      });
    }
  };

  const handleRecordedAudio = async (audioBlob: Blob) => {
    setUploading(true);
    
    try {
      // Create recording record
      const { data: recordingData, error: recordingError } = await supabase
        .from('recordings')
        .insert({
          original_filename: `recording_${new Date().getTime()}.webm`,
          mime_type: 'audio/webm',
          size_bytes: audioBlob.size,
          status: 'uploading',
          source: 'live_recording',
          duration_sec: recordingTime
        })
        .select()
        .single();

      if (recordingError) throw recordingError;

      // Upload to storage
      const filePath = `${user?.id}/${recordingData.id}/recording.webm`;
      const { error: uploadError } = await supabase.storage
        .from('audio-uploads')
        .upload(filePath, audioBlob);

      if (uploadError) throw uploadError;

      // Update with storage path
      const { error: updateError } = await supabase
        .from('recordings')
        .update({ 
          storage_path: filePath,
          status: 'queued'
        })
        .eq('id', recordingData.id);

      if (updateError) throw updateError;

      toast({
        title: "Recording saved",
        description: "Your recording is ready for transcription.",
      });

      fetchRecordings();
      
      // Auto-start transcription
      setTimeout(() => {
        handleTranscribe(recordingData);
      }, 1000);
      
    } catch (error) {
      console.error('Error saving recording:', error);
      toast({
        title: "Save failed",
        description: "Failed to save recording. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setRecordingTime(0);
    }
  };

  const handleTranslate = async (targetLang: string) => {
    if (!transcript) return;
    
    setTranslating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('translate-text', {
        body: { 
          transcriptId: transcript.id,
          targetLanguage: targetLang,
          text: transcript.text
        }
      });

      if (error) throw error;

      toast({
        title: "Translation completed",
        description: `Text translated to ${targetLang}`,
      });

      fetchTranslations(transcript.id);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation failed",
        description: "Failed to translate text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTranslating(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const userInitials = user.user_metadata?.full_name
    ?.split(' ')
    ?.map((name: string) => name[0])
    ?.join('')
    ?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Mic className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-xl font-bold">EchoFlow</h1>
              </div>
              
              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Remaining: <span className="font-medium text-foreground">15 minutes</span>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Crown className="w-3 h-3" />
                  Free Plan
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="hidden md:inline-flex">
                Upgrade to Pro
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>{userInitials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <Tabs defaultValue="record" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="record" className="gap-2">
              <Mic className="w-4 h-4" />
              <span className="hidden sm:inline">Record Live</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload File</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="translations" className="gap-2">
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Translations</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  Live Recording
                </CardTitle>
                <CardDescription>
                  Record audio directly from your microphone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-6">
                  <div className={`w-32 h-32 rounded-full mx-auto flex items-center justify-center ${
                    recording ? 'bg-red-500/20 animate-pulse' : 'bg-primary/10'
                  }`}>
                    <Mic className={`w-16 h-16 ${recording ? 'text-red-500' : 'text-primary'}`} />
                  </div>
                  
                  {recording && (
                    <div className="space-y-2">
                      <div className="text-2xl font-mono font-bold text-red-500">
                        {formatTime(recordingTime)}
                      </div>
                      <div className="flex justify-center">
                        <div className="flex space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-1 bg-red-500 rounded-full animate-pulse`}
                              style={{
                                height: `${Math.random() * 20 + 10}px`,
                                animationDelay: `${i * 0.1}s`
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground">Recording in progress...</p>
                    </div>
                  )}
                  
                  {!recording && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-semibold">Ready to Record</h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Click the record button below to start capturing audio from your microphone. 
                        Make sure to allow microphone access when prompted.
                      </p>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    {!recording ? (
                      <Button 
                        size="lg" 
                        onClick={startRecording}
                        disabled={uploading}
                        className="bg-red-500 hover:bg-red-600 text-white px-8"
                      >
                        <Mic className="w-5 h-5 mr-2" />
                        Start Recording
                      </Button>
                    ) : (
                      <Button 
                        size="lg" 
                        variant="outline"
                        onClick={stopRecording}
                        className="border-red-500 text-red-500 hover:bg-red-50 px-8"
                      >
                        <Pause className="w-5 h-5 mr-2" />
                        Stop Recording
                      </Button>
                    )}
                  </div>
                  
                  {uploading && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                        <span className="text-sm">Saving and processing recording...</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload Audio File
                </CardTitle>
                <CardDescription>
                  Upload an audio file to transcribe and translate
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                  <FileAudio className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Drop your audio file here</p>
                    <p className="text-sm text-muted-foreground">
                      Supports MP3, WAV, MP4, M4A, WebM (max 200MB)
                    </p>
                  </div>
                  <div className="mt-6">
                    <Button 
                      disabled={uploading} 
                      onClick={() => document.getElementById('audio-upload')?.click()}
                      className="cursor-pointer"
                    >
                      {uploading ? "Uploading..." : "Choose File"}
                    </Button>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="audio-upload"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {selectedRecording && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileAudio className="w-5 h-5" />
                    {selectedRecording.original_filename}
                  </CardTitle>
                  <CardDescription>
                    Status: <Badge variant="outline">{selectedRecording.status}</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedRecording.status === 'queued' && (
                    <Button 
                      onClick={() => handleTranscribe(selectedRecording)}
                      disabled={transcribing}
                    >
                      {transcribing ? "Transcribing..." : "Start Transcription"}
                    </Button>
                  )}
                  
                  {transcript && (
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Transcript</h4>
                        <div className="bg-muted p-4 rounded-lg">
                          <p className="text-sm">{transcript.text}</p>
                        </div>
                        <div className="flex gap-2 mt-2 text-xs text-muted-foreground">
                          <span>Confidence: {Math.round(transcript.confidence * 100)}%</span>
                          <span>Language: {transcript.language_detected}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTranslate('es')}
                          disabled={translating}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Translate to Spanish
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleTranslate('fr')}
                          disabled={translating}
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Translate to French
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Recording History</CardTitle>
                <CardDescription>View all your uploaded recordings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {recordings.map((recording) => (
                    <div 
                      key={recording.id}
                      className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        setSelectedRecording(recording);
                        fetchTranscript(recording.id);
                      }}
                    >
                      <div>
                        <p className="font-medium">{recording.original_filename}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(recording.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline">{recording.status}</Badge>
                    </div>
                  ))}
                  {recordings.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No recordings yet. Upload your first audio file!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="translations">
            <Card>
              <CardHeader>
                <CardTitle>Translations</CardTitle>
                <CardDescription>View all your translations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {translations.map((translation) => (
                    <div key={translation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{translation.target_lang.toUpperCase()}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(translation.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{translation.text}</p>
                    </div>
                  ))}
                  {translations.length === 0 && (
                    <p className="text-center text-muted-foreground py-8">
                      No translations yet. Transcribe an audio file and translate it!
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default App;