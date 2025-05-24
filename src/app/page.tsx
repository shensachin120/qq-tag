import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, ShieldCheck, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center text-center space-y-12">
      <header className="space-y-4 mt-8">
        <h1 className="text-5xl font-bold tracking-tight text-primary">Welcome to StickerFind!</h1>
        <p className="text-xl text-foreground/80 max-w-2xl mx-auto">
          The smart way to get your lost items back. Tag your valuables with our QR stickers, and let finders contact you easily.
        </p>
        <div className="space-x-4 pt-4">
          <Button size="lg" asChild style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} className="hover:opacity-90">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="#how-it-works">Learn More</Link>
          </Button>
        </div>
      </header>

      <section id="features" className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="items-center">
            <QrCode className="w-12 h-12 text-primary mb-2" />
            <CardTitle>Unique QR Stickers</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Generate and manage durable stickers with unique QR codes. Finders scan to see your contact information.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="items-center">
            <Users className="w-12 h-12 text-primary mb-2" />
            <CardTitle>User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Easily sign up, manage your profile, link QR codes to your items, and update your contact preferences.
            </CardDescription>
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="items-center">
            <ShieldCheck className="w-12 h-12 text-primary mb-2" />
            <CardTitle>Secure & Private</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              You control what contact information is shared. Your privacy is our priority.
            </CardDescription>
          </CardContent>
        </Card>
      </section>
      
      <section id="how-it-works" className="w-full max-w-4xl space-y-8 py-12">
        <h2 className="text-3xl font-semibold text-primary">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Image 
              src="https://placehold.co/600x400.png" 
              alt="Person using StickerFind QR code" 
              width={600} 
              height={400} 
              className="rounded-lg shadow-lg"
              data-ai-hint="qr code item"
            />
          </div>
          <div className="space-y-4 text-left">
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">1</div>
              <p><span className="font-semibold">Tag It:</span> Attach a StickerFind QR sticker to your valuable items.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">2</div>
              <p><span className="font-semibold">Lose It (Oops!):</span> If your item gets lost, the QR code is its lifeline.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">3</div>
              <p><span className="font-semibold">Finder Scans:</span> Anyone who finds your item can scan the QR code.</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold shrink-0">4</div>
              <p><span className="font-semibold">Get Contacted:</span> The finder sees your chosen contact details to arrange its return.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
