"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  getSettingsData,
  updateProfile,
  removeProfilePicture,
  deleteAccount,
  SettingsData,
} from "./componentsaction/actions";
import { toast } from "sonner";

export default function SettingsPage() {
  const [data, setData] = useState<SettingsData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [isEditing, setIsEditing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");

  // Delete Account States
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await getSettingsData();
        if (error) {
          toast.error(error);
          return;
        }
        if (data) {
          setData(data);
          setAvatarUrl(data.user.image);
          const names = data.user.name.split(" ");
          setFirstName(names[0] || "");
          setLastName(names.slice(1).join(" ") || "");
        }
      } catch (error) {
        console.error("Failed to fetch settings", error);
        toast.error("Failed to load settings");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing — reset fields to original values
      if (data) {
        const names = data.user.name.split(" ");
        setFirstName(names[0] || "");
        setLastName(names.slice(1).join(" ") || "");
      }
      setIsEditing(false);
    } else {
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);

    const { success, error } = await updateProfile(firstName, lastName);

    setIsSavingProfile(false);

    if (success) {
      setIsEditing(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error(error || "Failed to update profile");
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    // Validate file size (2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

    setIsUploadingAvatar(true);

    try {
      const formPayload = new FormData();
      formPayload.append("file", file);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formPayload,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to upload avatar");
      }

      const { avatarUrl } = await response.json();
      setAvatarUrl(avatarUrl);
      toast.success("Profile picture updated");
    } catch (error) {
      console.error("Avatar upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload avatar",
      );
    } finally {
      setIsUploadingAvatar(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (isRemovingAvatar) return;

    setIsRemovingAvatar(true);

    try {
      const { success, error } = await removeProfilePicture();

      if (success) {
        setAvatarUrl("");
        toast.success("Profile picture removed");
      } else {
        throw new Error(error || "Failed to remove profile picture");
      }
    } catch (error) {
      console.error("Avatar remove error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to remove profile picture",
      );
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);

    try {
      const { success, error } = await deleteAccount();

      if (success) {
        toast.success("Account deleted permanently");
        setDeleteDialogOpen(false);
        // Redirect to login — the session is now invalid
        router.push("/login");
      } else {
        throw new Error(error || "Failed to delete account");
      }
    } catch (error) {
      console.error("Delete account error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete account. Please try again or contact support.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteDialogOpenChange = (open: boolean) => {
    setDeleteDialogOpen(open);
    if (!open) {
      // Reset the confirmation input when dialog closes
      setConfirmName("");
    }
  };

  const handleOpenDeleteDialog = () => {
    setConfirmName("");
    setDeleteDialogOpen(true);
  };

  if (!mounted || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace preferences and account details.
        </p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>
                  Manage your public profile and personal details.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      {avatarUrl ? (
                        <AvatarImage src={avatarUrl} alt={data?.user.name} />
                      ) : null}
                      <AvatarFallback>
                        {data?.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={isUploadingAvatar}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                      >
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          "Change"
                        )}
                      </Button>
                      {avatarUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={handleRemoveAvatar}
                          disabled={isRemovingAvatar}
                        >
                          {isRemovingAvatar ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              Removing...
                            </>
                          ) : (
                            "Remove"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input
                      id="first-name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input
                      id="last-name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" defaultValue={data?.user.email} disabled />
                  <p className="text-[0.8rem] text-muted-foreground">
                    Your email address is managed by your organization.
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4 flex justify-between">
                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSavingProfile}
                      >
                        {isSavingProfile ? (
                          <>
                            <Spinner className="h-4 w-4 mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Profile"
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={handleEditToggle}
                        disabled={isSavingProfile}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="outline" onClick={handleEditToggle}>
                      Edit Profile
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>

            <Card className="border-red-200 dark:border-red-900">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-500">
                  Danger Zone
                </CardTitle>
                <CardDescription>
                  Irreversible and destructive actions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" onClick={handleOpenDeleteDialog}>
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog
        open={deleteDialogOpen}
        onOpenChange={handleDeleteDialogOpenChange}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent and irreversible. Deleting your account
              will remove all data, sessions, tasks, projects, and workspace
              memberships.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="px-6 space-y-3">
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>Remove all your personal data, sessions, and accounts</li>
              <li>Delete all tasks and projects you own</li>
              <li>Remove you from all workspaces and teams</li>
              <li>Delete your profile and avatar</li>
            </ul>
            <p className="text-sm font-medium">
              Type{" "}
              <span className="font-bold text-foreground">
                delete my account {data?.user.name}
              </span>{" "}
              to confirm.
            </p>
          </div>
          <div className="px-6 pb-2">
            <Input
              placeholder='Type "delete my account <your name>" to confirm'
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              disabled={isDeleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={
                confirmName !== `delete my account ${data?.user.name}` ||
                isDeleting
              }
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Spinner className="h-4 w-4 mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete My Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
