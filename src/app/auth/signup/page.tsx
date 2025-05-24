import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create your StickerFind Account</CardTitle>
        <CardDescription>Join us and never lose your items again!</CardDescription>
      </CardHeader>
      <CardContent>
        <UserAuthForm mode="signup" />
      </CardContent>
    </Card>
  );
}
