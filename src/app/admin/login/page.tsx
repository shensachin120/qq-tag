
"use client"; // Required for useRouter and useEffect

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLayout from "@/app/auth/layout";

export default function AdminLoginPageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the main sign-in page
    router.replace('/auth/signin?message=admin_login_redirected');
  }, [router]);

  return (
    <AuthLayout>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Login</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            Admin login has been moved to the main sign-in page. Redirecting...
          </CardDescription>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}

    