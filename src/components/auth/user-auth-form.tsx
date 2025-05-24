"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Mail, Key, User, LogIn as LoginIcon } from "lucide-react";
import Link from "next/link";

const signInSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

const signUpSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters."}),
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type UserAuthFormProps = {
  mode: "signin" | "signup";
};

export function UserAuthForm({ mode }: UserAuthFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const schema = mode === "signin" ? signInSchema : signUpSchema;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: mode === 'signin' ? { email: "", password: "" } : { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (mode === "signin") {
      // Mock successful sign-in
      if (values.email === "user@example.com" && values.password === "password") {
        localStorage.setItem('isUserLoggedIn', 'true');
        toast({ title: "Sign In Successful", description: "Welcome back!" });
        router.push("/dashboard");
      } else {
        toast({ title: "Sign In Failed", description: "Invalid email or password.", variant: "destructive" });
      }
    } else {
      // Mock successful sign-up
      localStorage.setItem('isUserLoggedIn', 'true'); // Auto-login after signup
      toast({ title: "Sign Up Successful", description: "Welcome to StickerFind!" });
      router.push("/dashboard");
    }
  }
  
  async function handleGoogleSignIn() {
    toast({ title: "Signing in with Google...", description: "This is a mock action." });
    // Mock Google sign-in
    await new Promise(resolve => setTimeout(resolve, 1500));
    localStorage.setItem('isUserLoggedIn', 'true');
    toast({ title: "Google Sign In Successful", description: "Welcome!" });
    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-md">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {mode === "signup" && (
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input placeholder="John Doe" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {mode === "signup" && (
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <Button type="submit" className="w-full" style={{backgroundColor: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))'}} >
            <LoginIcon className="mr-2 h-5 w-5" />
            {mode === "signin" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
      </Form>
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <Button variant="outline" className="w-full" onClick={handleGoogleSignIn}>
        {/* Placeholder for Google Icon. In real app, use an SVG or library */}
        <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.99C17.74 15.61 17.02 16.76 15.92 17.49V20.04H19.52C21.45 18.27 22.56 15.52 22.56 12.25Z" fill="#4285F4"></path><path d="M12 23C14.97 23 17.45 22.04 19.52 20.04L15.92 17.49C14.99 18.13 13.62 18.54 12 18.54C9.05 18.54 6.56 16.62 5.53 13.99H1.88V16.61C3.84 20.44 7.64 23 12 23Z" fill="#34A853"></path><path d="M5.53 13.99C5.3 13.32 5.16 12.63 5.16 11.93C5.16 11.23 5.3 10.54 5.53 9.87V7.25H1.88C0.980001 9.05 0.440001 10.92 0.440001 12.88C0.440001 14.84 0.980001 16.71 1.88 18.47L5.53 13.99Z" fill="#FBBC05"></path><path d="M12 5.45C13.44 5.45 14.74 5.95 15.79 6.95L19.58 3.2C17.45 1.21 14.97 0 12 0C7.64 0 3.84 2.56 1.88 7.25L5.53 9.87C6.56 7.24 9.05 5.45 12 5.45Z" fill="#EA4335"></path></svg>
        Sign in with Google
      </Button>
      {mode === "signin" ? (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      ) : (
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      )}
    </div>
  );
}
