"use client";

import { UserMenu } from "@/components/auth/user-menu";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-black">Todo App</h1>
        </div>
        <UserMenu />
      </div>
    </header>
  );
}
