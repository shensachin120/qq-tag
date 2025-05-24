"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QrCode as QrCodeIcon, UserCircle2, Link as LinkIcon, Unlink, Trash2, Edit3 } from "lucide-react";
import type { User, QrCode } from "@/types";
import { mockUser, mockQrCodes } from "@/types"; // Using mock data
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Mock functions, replace with actual API calls / Server Actions
async function fetchUserData(): Promise<User> {
  return new Promise(resolve => setTimeout(() => resolve(mockUser), 500));
}

async function fetchUserQrCodes(userId: string): Promise<QrCode[]> {
  return new Promise(resolve => setTimeout(() => resolve(mockQrCodes.filter(qr => qr.ownerId === userId && qr.status === 'claimed')), 500));
}

async function updateProfile(userData: Partial<User>): Promise<User> {
  console.log("Updating profile:", userData);
  // Update mockUser or make API call
  Object.assign(mockUser, userData);
  return new Promise(resolve => setTimeout(() => resolve(mockUser), 500));
}

async function unlinkQrCode(qrId: string): Promise<void> {
  console.log("Unlinking QR Code:", qrId);
  const qr = mockQrCodes.find(q => q.uniqueId === qrId);
  if (qr) {
    qr.status = "unclaimed";
    qr.ownerId = undefined;
    qr.claimedAt = undefined;
    qr.contactInfo = undefined;
  }
  return new Promise(resolve => setTimeout(resolve, 500));
}

async function deleteQrCode(qrId: string): Promise<void> {
  console.log("Deleting QR Code:", qrId);
  const qr = mockQrCodes.find(q => q.uniqueId === qrId);
  if (qr) {
    qr.status = "deleted";
  }
  return new Promise(resolve => setTimeout(resolve, 500));
}


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [linkedQrs, setLinkedQrs] = useState<QrCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");


  useEffect(() => {
    const checkAuth = () => {
      if (localStorage.getItem('isUserLoggedIn') !== 'true') {
        router.push('/auth/signin');
      }
    };
    checkAuth();

    async function loadData() {
      setIsLoading(true);
      const userData = await fetchUserData();
      setUser(userData);
      setName(userData.name);
      setEmail(userData.email);
      setPhone(userData.phone || "");
      setWhatsappLink(userData.whatsappLink || "");
      if (userData) {
        const qrData = await fetchUserQrCodes(userData.id);
        setLinkedQrs(qrData);
      }
      setIsLoading(false);
    }
    loadData();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await updateProfile({ name, email, phone, whatsappLink });
      toast({ title: "Profile Updated", description: "Your information has been saved." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not update profile.", variant: "destructive" });
    }
  };

  const handleUnlink = async (qrId: string) => {
    try {
      await unlinkQrCode(qrId);
      setLinkedQrs(prev => prev.filter(qr => qr.uniqueId !== qrId));
      toast({ title: "QR Unlinked", description: `QR Code ${qrId} is now available for others to claim.` });
    } catch (error) {
      toast({ title: "Unlink Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (qrId: string) => {
     try {
      await deleteQrCode(qrId);
      setLinkedQrs(prev => prev.filter(qr => qr.uniqueId !== qrId)); // Optimistically remove from UI
      toast({ title: "QR Deleted", description: `QR Code ${qrId} has been deleted and is unusable.` });
    } catch (error) {
      toast({ title: "Delete Failed", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-center py-10">Loading dashboard...</div>;
  }

  if (!user) {
    return <div className="text-center py-10">User not found. Please log in again.</div>;
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-primary">Welcome, {user.name}!</h1>
      
      <Tabs defaultValue="qrcodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="qrcodes"><QrCodeIcon className="mr-2 h-4 w-4" />My QR Codes</TabsTrigger>
          <TabsTrigger value="profile"><UserCircle2 className="mr-2 h-4 w-4" />Profile</TabsTrigger>
        </TabsList>
        
        <TabsContent value="qrcodes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Linked QR Codes</CardTitle>
              <CardDescription>Manage QR codes linked to your account. You can unlink them or mark them as deleted.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {linkedQrs.length === 0 ? (
                <p>You have no QR codes linked to your account yet. Scan an unclaimed QR code to link it!</p>
              ) : (
                <ul className="space-y-3">
                  {linkedQrs.map((qr) => (
                    <li key={qr.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-lg shadow-sm gap-3">
                      <div className="flex items-center gap-3">
                        <QrCodeIcon className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-semibold">{qr.uniqueId}</p>
                          <p className="text-sm text-muted-foreground">Claimed on: {new Date(qr.claimedAt!).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-2 sm:mt-0 shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleUnlink(qr.uniqueId)}>
                          <Unlink className="mr-1 h-4 w-4" /> Unlink
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDelete(qr.uniqueId)}>
                          <Trash2 className="mr-1 h-4 w-4" /> Delete
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <Button asChild className="mt-4" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                {/* This would ideally take user to a page or modal to scan a new QR code */}
                <a href="/#how-it-works"> {/* Placeholder link */}
                  <LinkIcon className="mr-2 h-4 w-4" /> Link a New QR Code
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Manage Your Profile</CardTitle>
              <CardDescription>Keep your contact information up to date so finders can reach you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-6 max-w-lg">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number (Optional)</Label>
                  <Input id="phone" type="tel" placeholder="e.g., +1 555-123-4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Link (Optional)</Label>
                  <Input id="whatsapp" type="url" placeholder="e.g., https://wa.me/15551234567" value={whatsappLink} onChange={(e) => setWhatsappLink(e.target.value)} />
                  <p className="text-xs text-muted-foreground mt-1">Ensure this is a direct link to your WhatsApp chat.</p>
                </div>
                <Button type="submit" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}}>
                  <Edit3 className="mr-2 h-4 w-4" /> Save Changes
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
