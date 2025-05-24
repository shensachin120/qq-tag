import { AdminAuthForm } from "@/components/auth/admin-auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AuthLayout from "@/app/auth/layout";

export default function AdminLoginPage() {
  return (
    <AuthLayout>
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Admin Panel Login</CardTitle>
          <CardDescription>Access the StickerFind administration area.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminAuthForm />
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
