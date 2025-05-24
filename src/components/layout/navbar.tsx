
// For now, we'll use simple state for auth status. Replace with actual auth logic.
"use client"; 

import Link from 'next/link';
import { QrCode, LogIn, LogOut, UserCircle2, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// Mock auth state. In a real app, this would come from a context or server session.
const useMockAuth = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsUserLoggedIn(localStorage.getItem('isUserLoggedIn') === 'true');
    setIsAdminLoggedIn(localStorage.getItem('isAdminLoggedIn') === 'true');
  }, [pathname]);
  
  const logoutUser = () => {
    localStorage.removeItem('isUserLoggedIn');
    setIsUserLoggedIn(false);
    router.push('/'); 
  };

  const logoutAdmin = () => {
    localStorage.removeItem('isAdminLoggedIn');
    setIsAdminLoggedIn(false);
    router.push('/');
  };

  return { isUserLoggedIn, isAdminLoggedIn, logoutUser, logoutAdmin };
};


export default function Navbar() {
  const { isUserLoggedIn, isAdminLoggedIn, logoutUser, logoutAdmin } = useMockAuth();
  const pathname = usePathname();

  const handleLogout = () => {
    if (isUserLoggedIn) logoutUser();
    if (isAdminLoggedIn) logoutAdmin();
    // Navigation is handled within logoutUser/logoutAdmin
  };
  
  return (
    <nav className="bg-primary shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 text-primary-foreground hover:text-opacity-80 transition-opacity">
            <QrCode size={32} />
            <span className="text-2xl font-bold">StickerFind</span>
          </Link>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
              <Link href="/">Home</Link>
            </Button>

            {isUserLoggedIn ? (
              <>
                <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                  <Link href="/dashboard">
                    <LayoutDashboard size={18} className="mr-2" /> Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
                     <LogOut size={18} className="mr-2" /> Logout
                </Button>
              </>
            ) : isAdminLoggedIn ? (
              <>
                <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                  <Link href="/admin/dashboard">
                    <ShieldCheck size={18} className="mr-2" /> Admin Panel
                  </Link>
                </Button>
                 <Button variant="ghost" onClick={handleLogout} className="text-primary-foreground hover:bg-primary/80">
                     <LogOut size={18} className="mr-2" /> Logout
                 </Button>
              </>
            ) : (
              <>
                {pathname !== '/auth/signin' && pathname !== '/auth/signup' && (
                  <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                    <Link href="/auth/signin">
                      <LogIn size={18} className="mr-2" /> Login
                    </Link>
                  </Button>
                )}
                {pathname !== '/auth/signup' && (
                   <Button variant="default" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} asChild className="hover:opacity-90">
                     <Link href="/auth/signup">
                       <UserCircle2 size={18} className="mr-2" /> Sign Up
                     </Link>
                   </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

    