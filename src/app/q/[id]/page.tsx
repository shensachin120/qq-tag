"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode as QrCodeIcon, User, Link as LinkIcon, Mail, Phone, MessageSquare, AlertTriangle, CheckCircle } from "lucide-react";
import type { QrCode, User as UserType } from "@/types";
import { mockQrCodes, mockUser } from "@/types"; // Using mock data
import { useToast } from "@/hooks/use-toast";
import { APP_DOMAIN } from "@/lib/constants";

// Mock function: Get QR details
async function fetchQrDetails(qrId: string): Promise<QrCode | null> {
  // In a real app, query your database for qrId (which is `params.id`)
  const qr = mockQrCodes.find(q => q.uniqueId === qrId);
  return new Promise(resolve => setTimeout(() => resolve(qr || null), 500));
}

// Mock function: Claim QR
async function claimQrCode(qrId: string, userId: string): Promise<boolean> {
  console.log(`User ${userId} claiming QR ${qrId}`);
  const qr = mockQrCodes.find(q => q.uniqueId === qrId);
  const user = mockUser; // Assuming current logged in user is mockUser
  if (qr && qr.status === 'unclaimed' && user) {
    qr.status = 'claimed';
    qr.ownerId = userId;
    qr.claimedAt = new Date().toISOString();
    qr.contactInfo = { // Store contact info at time of claim for quick display
        email: user.email,
        phone: user.phone,
        whatsappLink: user.whatsappLink
    };
    // Update user's linked QRs (mock)
    if (!user.linkedQrCodes.includes(qrId)) {
      user.linkedQrCodes.push(qrId);
    }
    return new Promise(resolve => setTimeout(() => resolve(true), 500));
  }
  return new Promise(resolve => setTimeout(() => resolve(false), 500));
}


export default function QrCodePage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const qrId = params.id as string;

  const [qrDetails, setQrDetails] = useState<QrCode | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Mock auth check

  useEffect(() => {
    // Mock: check if user is logged in
    setIsUserLoggedIn(localStorage.getItem('isUserLoggedIn') === 'true');

    if (qrId) {
      async function loadQrData() {
        setIsLoading(true);
        const data = await fetchQrDetails(qrId);
        setQrDetails(data);
        setIsLoading(false);
      }
      loadQrData();
    }
  }, [qrId]);

  const handleClaimQr = async () => {
    if (!qrDetails || !isUserLoggedIn) return;
    // Assume mockUser.id is the logged-in user's ID for this mock
    const success = await claimQrCode(qrDetails.uniqueId, mockUser.id); 
    if (success) {
      toast({ title: "QR Code Claimed!", description: `QR ${qrDetails.uniqueId} is now linked to your account.` });
      // Refresh data or update state
      const updatedData = await fetchQrDetails(qrId);
      setQrDetails(updatedData);
    } else {
      toast({ title: "Claim Failed", description: "Could not claim this QR code. It might already be claimed or an error occurred.", variant: "destructive" });
    }
  };

  if (isLoading) {
    return <div className="text-center py-20">Loading QR Code information...</div>;
  }

  if (!qrDetails) {
    return (
      <Card className="max-w-lg mx-auto shadow-xl text-center">
        <CardHeader>
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl">QR Code Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            The QR code ID <span className="font-semibold">{qrId}</span> does not seem to exist in our system. 
            Please check the ID or contact support if you believe this is an error.
          </CardDescription>
          <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
        </CardContent>
      </Card>
    );
  }

  if (qrDetails.status === 'deleted') {
    return (
      <Card className="max-w-lg mx-auto shadow-xl text-center">
        <CardHeader>
          <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <CardTitle className="text-2xl">QR Code Inactive</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            This QR code (<span className="font-semibold">{qrDetails.uniqueId}</span>) has been marked as deleted and is no longer in service.
          </CardDescription>
           <Button onClick={() => router.push('/')} className="mt-6">Go to Homepage</Button>
        </CardContent>
      </Card>
    );
  }
  
  const qrCodeUrl = `${APP_DOMAIN}/q/${qrDetails.uniqueId}`;
  const placeholderQrImage = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeUrl)}`;


  return (
    <div className="max-w-lg mx-auto">
      <Card className="shadow-xl">
        <CardHeader className="text-center items-center">
          <Image 
            src={placeholderQrImage} 
            alt={`QR Code for ${qrDetails.uniqueId}`} 
            width={200} 
            height={200} 
            className="rounded-md border p-1 mb-4"
            data-ai-hint="qr code"
          />
          <CardTitle className="text-3xl text-primary">{qrDetails.uniqueId}</CardTitle>
          <CardDescription className="mt-1">
            Scan this QR code to report a found item.
          </CardDescription>
          <p className="font-semibold text-lg mt-2">Scan to Return</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {qrDetails.status === 'claimed' && qrDetails.contactInfo && (
            <div className="space-y-4 p-4 border rounded-lg bg-green-50 border-green-200">
              <h3 className="text-xl font-semibold text-green-700 flex items-center">
                <CheckCircle className="mr-2 h-6 w-6" /> Item Claimed! Contact Owner:
              </h3>
              {qrDetails.contactInfo.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="h-5 w-5 text-green-600" />
                  <a href={`mailto:${qrDetails.contactInfo.email}`} className="text-green-700 hover:underline">{qrDetails.contactInfo.email}</a>
                </div>
              )}
              {qrDetails.contactInfo.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-5 w-5 text-green-600" />
                  <a href={`tel:${qrDetails.contactInfo.phone}`} className="text-green-700 hover:underline">{qrDetails.contactInfo.phone}</a>
                </div>
              )}
              {qrDetails.contactInfo.whatsappLink && (
                <div className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <a href={qrDetails.contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">Contact on WhatsApp</a>
                </div>
              )}
              {!qrDetails.contactInfo.email && !qrDetails.contactInfo.phone && !qrDetails.contactInfo.whatsappLink && (
                <p className="text-muted-foreground">The owner has not provided public contact details for this item.</p>
              )}
            </div>
          )}

          {qrDetails.status === 'unclaimed' && (
            <div className="text-center space-y-3 p-4 border rounded-lg bg-blue-50 border-blue-200">
              <h3 className="text-xl font-semibold text-blue-700">This QR Code is Unclaimed</h3>
              {isUserLoggedIn ? (
                <>
                  <p className="text-blue-600">You can link this QR code to your account.</p>
                  <Button onClick={handleClaimQr} size="lg" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} className="w-full">
                    <LinkIcon className="mr-2 h-5 w-5" /> Claim This QR Code
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-blue-600">Log in or sign up to claim this QR code and protect your item.</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button onClick={() => router.push(`/auth/signin?redirect=/q/${qrId}`)} className="w-full sm:w-auto">Login to Claim</Button>
                    <Button onClick={() => router.push(`/auth/signup?redirect=/q/${qrId}`)} variant="outline" className="w-full sm:w-auto">Sign Up</Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          <div className="text-center pt-4">
            <Button variant="link" onClick={() => router.push('/')}>Go to StickerFind Homepage</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
