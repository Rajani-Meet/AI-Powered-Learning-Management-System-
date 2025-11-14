"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardBody, CardHeader } from "@nextui-org/card";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
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

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage("New passwords don't match");
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
        setMessage("Profile updated successfully");
        setFormData(prev => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        }));
        await update();
      } else {
        setMessage(data.error || "Update failed");
      }
    } catch (error) {
      setMessage("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardBody className="text-center py-12">
            <p>Please sign in to view your profile</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <div className="flex items-center gap-2">
              <Chip color="primary" variant="flat" size="sm">
                {session.user.role}
              </Chip>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="space-y-2">
                <label htmlFor="profile-name" className="text-sm font-semibold">Full Name</label>
                <Input
                  id="profile-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-email" className="text-sm font-semibold">Email</label>
                <Input
                  id="profile-email"
                  value={formData.email}
                  disabled
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>

            <Divider />

            {/* Password Change */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Change Password</h3>
              <p className="text-sm text-gray-600">Leave blank to keep current password</p>
              <div className="space-y-2">
                <label htmlFor="profile-current-password" className="text-sm font-semibold">Current Password</label>
                <Input
                  id="profile-current-password"
                  type="password"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter current password"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-new-password" className="text-sm font-semibold">New Password</label>
                <Input
                  id="profile-new-password"
                  type="password"
                  value={formData.newPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                  placeholder="Enter new password"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="profile-confirm-password" className="text-sm font-semibold">Confirm New Password</label>
                <Input
                  id="profile-confirm-password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-lg text-sm ${
                message.includes("success") 
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}>
                {message}
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}