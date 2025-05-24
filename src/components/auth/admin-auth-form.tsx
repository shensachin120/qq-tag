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
import { Key, UserShield, LogIn as LoginIcon } from "lucide-react";
import { ADMIN_USERNAME, ADMIN_PASSWORD } from "@/lib/constants";

const adminLoginSchema = z.object({
  username: z.string().min(1, { message: "Username is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

export function AdminAuthForm() {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof adminLoginSchema>>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: { username: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof adminLoginSchema>) {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (values.username === ADMIN_USERNAME && values.password === ADMIN_PASSWORD) {
      localStorage.setItem('isAdminLoggedIn', 'true');
      toast({ title: "Admin Login Successful", description: "Welcome, Admin!" });
      router.push("/admin/dashboard");
    } else {
      toast({ title: "Admin Login Failed", description: "Invalid username or password.", variant: "destructive" });
    }
  }

  return (
    <div className="w-full max-w-sm">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <UserShield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input placeholder="admin_user" {...field} className="pl-10" />
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
          <Button type="submit" className="w-full" variant="default">
             <LoginIcon className="mr-2 h-5 w-5" />
            Admin Login
          </Button>
        </form>
      </Form>
    </div>
  );
}
