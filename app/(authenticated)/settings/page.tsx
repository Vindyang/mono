"use client";

import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, Slack, Figma } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] gap-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your workspace preferences and account details.
        </p>
      </div>
      
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>

        {/* Workspace Settings */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Workspace Settings</CardTitle>
                <CardDescription>
                  Manage your workspace name and identifier.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="workspace-name">Workspace Name</Label>
                  <Input id="workspace-name" defaultValue="My Awesome Project" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="workspace-id">Workspace URL</Label>
                  <div className="flex rounded-md shadow-sm">
                     <span className="inline-flex items-center rounded-l-md border border-r-0 border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
                        app.todo.com/
                     </span>
                     <Input id="workspace-id" defaultValue="awesome-project" className="rounded-l-none" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle>Appearance</CardTitle>
                 <CardDescription>
                    Customize how the application looks on your device.
                 </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6">
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="theme-mode" className="flex flex-col space-y-1">
                       <span>Dark Mode</span>
                       <span className="font-normal leading-snug text-muted-foreground">
                          Switch between light and dark themes.
                       </span>
                    </Label>
                    <Switch id="theme-mode" />
                 </div>
                 <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="animations" className="flex flex-col space-y-1">
                       <span>Animations</span>
                       <span className="font-normal leading-snug text-muted-foreground">
                          Enable subtle animations throughout the app.
                       </span>
                    </Label>
                    <Switch id="animations" defaultChecked />
                 </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

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
                                  <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
                                  <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                              <div className="flex gap-2">
                                  <Button variant="outline" size="sm">Change</Button>
                                  <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">Remove</Button>
                              </div>
                          </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                          <div className="grid gap-2">
                              <Label htmlFor="first-name">First name</Label>
                              <Input id="first-name" defaultValue="Vindy" />
                          </div>
                          <div className="grid gap-2">
                              <Label htmlFor="last-name">Last name</Label>
                              <Input id="last-name" defaultValue="Anggiono" />
                          </div>
                      </div>

                      <div className="grid gap-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" defaultValue="vindy@example.com" disabled />
                          <p className="text-[0.8rem] text-muted-foreground">
                              Your email address is managed by your organization.
                          </p>
                      </div>
                  </CardContent>
                   <CardFooter className="border-t px-6 py-4">
                      <Button>Save Profile</Button>
                  </CardFooter>
              </Card>

               <Card className="border-red-200 dark:border-red-900">
                  <CardHeader>
                      <CardTitle className="text-red-600 dark:text-red-500">Danger Zone</CardTitle>
                      <CardDescription>
                          Irreversible and destructive actions.
                      </CardDescription>
                  </CardHeader>
                  <CardContent>
                       <Button variant="destructive">Delete Account</Button>
                  </CardContent>
              </Card>
          </div>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="mt-6 space-y-6">
          <div className="grid gap-4">
              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-zinc-50 dark:bg-zinc-900">
                          <Github className="h-6 w-6" />
                      </div>
                      <div>
                          <p className="text-sm font-medium leading-none">GitHub</p>
                          <p className="text-sm text-muted-foreground">Sync issues and pull requests.</p>
                      </div>
                  </div>
                  <Button variant="outline">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-zinc-50 dark:bg-zinc-900">
                          <Slack className="h-6 w-6" />
                      </div>
                      <div>
                          <p className="text-sm font-medium leading-none">Slack</p>
                          <p className="text-sm text-muted-foreground">Receive notifications in your channels.</p>
                      </div>
                  </div>
                  <Button variant="outline">Connect</Button>
              </div>

              <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
                  <div className="flex items-center space-x-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-zinc-50 dark:bg-zinc-900">
                          <Figma className="h-6 w-6" />
                      </div>
                      <div>
                          <p className="text-sm font-medium leading-none">Figma</p>
                          <p className="text-sm text-muted-foreground">Embed designs directly in tasks.</p>
                      </div>
                  </div>
                   <Button variant="secondary" disabled>Coming Soon</Button>
              </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
