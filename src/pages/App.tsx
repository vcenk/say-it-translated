import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Mic, Upload, History, Settings, User, LogOut, Crown } from 'lucide-react';

export default function App() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
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
              <Button variant="premium" size="sm" className="hidden md:inline-flex">
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
              <span className="hidden sm:inline">Record</span>
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="w-4 h-4" />
              <span className="hidden sm:inline">History</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="record" className="space-y-6">
            <div className="text-center">
              <div className="bg-card rounded-2xl border border-border p-8 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Mic className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Record Audio</h2>
                <p className="text-muted-foreground mb-6">
                  Click the record button to start capturing audio from your microphone
                </p>
                <Button size="lg" className="gap-2">
                  <Mic className="w-5 h-5" />
                  Start Recording
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <div className="text-center">
              <div className="bg-card rounded-2xl border border-border border-dashed p-8 max-w-2xl mx-auto">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-4">Upload Audio</h2>
                <p className="text-muted-foreground mb-6">
                  Drag and drop your audio or video files here, or click to browse
                </p>
                <Button size="lg" variant="outline" className="gap-2">
                  <Upload className="w-5 h-5" />
                  Choose Files
                </Button>
                <p className="text-sm text-muted-foreground mt-4">
                  Supports MP3, WAV, M4A, MP4, and WEBM files up to 20MB
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
                <History className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-4">No recordings yet</h2>
              <p className="text-muted-foreground mb-6">
                Your transcribed recordings will appear here
              </p>
              <Button variant="outline">
                <Mic className="w-4 h-4 mr-2" />
                Start your first recording
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-bold mb-6">Settings</h2>
              <div className="bg-card rounded-2xl border border-border p-6">
                <p className="text-muted-foreground">Settings panel coming soon...</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}