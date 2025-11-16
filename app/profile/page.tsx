"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
import { BackButton } from "@/components/ui/back-button";
import { AppLayout } from "@/components/layout/app-layout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        name: session.user.name || "",
        email: session.user.email || ""
      }));
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords don't match");
      setMessageType("error");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setMessageType("success");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        await update();
        setTimeout(() => {
          setMessage("");
          setMessageType(null);
        }, 3000);
      } else {
        setMessage(data.error || "Update failed");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
      setMessageType("error");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="shadow-lg">
            <CardBody className="text-center py-12">
              <p className="text-muted-foreground">Please sign in to view your profile</p>
            </CardBody>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AppLayout maxWidth="2xl">
      <div className="mb-6">
        <BackButton />
      </div>
      
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
          <CardBody className="p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background shadow-xl">
                  <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                  <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-primary-foreground text-2xl font-bold">
                    {getInitials(session.user.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1.5 border-4 border-background">
                  <div className="h-3 w-3 bg-success rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  {session.user.name || "User"}
                </h1>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{session.user.email}</span>
                  </div>
                  <Chip 
                    color="primary" 
                    variant="flat" 
                    size="lg"
                    className="font-semibold"
                  >
                    {session.user.role}
                  </Chip>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Profile Form */}
        <Card className="shadow-lg border-0">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Edit Profile</h2>
            </div>
          </CardHeader>
          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Basic Information
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Update your personal information
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-name" className="text-sm font-medium flex items-center gap-2">
                      Full Name
                    </label>
                    <Input
                      id="profile-name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter your full name"
                      required
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="profile-email" className="text-sm font-medium flex items-center gap-2">
                      <Mail className="h-3.5 w-3.5" />
                      Email Address
                    </label>
                    <Input
                      id="profile-email"
                      value={formData.email}
                      disabled
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 bg-muted/50"
                      }}
                    />
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Email cannot be changed
                    </p>
                  </div>
                </div>
              </div>

              <Divider className="my-6" />

              {/* Password Change Section */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Change Password
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Leave blank to keep your current password
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="profile-current-password" className="text-sm font-medium">
                      Current Password
                    </label>
                    <Input
                      id="profile-current-password"
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                      placeholder="Enter current password"
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="profile-new-password" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input
                      id="profile-new-password"
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                      placeholder="Enter new password (min. 6 characters)"
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="profile-confirm-password" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input
                      id="profile-confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      placeholder="Confirm new password"
                      variant="bordered"
                      classNames={{
                        input: "text-base",
                        inputWrapper: "border-2 hover:border-primary/50 transition-colors"
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Message Alert */}
              {message && (
                <div className={`p-4 rounded-xl border-2 flex items-start gap-3 transition-all duration-300 ${
                  messageType === "success"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-destructive/10 text-destructive border-destructive/20"
                }`}>
                  {messageType === "success" ? (
                    <CheckCircle2 className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  )}
                  <p className="text-sm font-medium flex-1">{message}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  color="primary"
                  size="lg"
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[200px] font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? "Updating..." : "Update Profile"}
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </AppLayout>
  );
}