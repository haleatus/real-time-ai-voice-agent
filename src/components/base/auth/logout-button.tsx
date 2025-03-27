"use client";

// React imports
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// UI imports
import { Button } from "@/components/ui/button";

// Actions imports
import { signOut } from "@/lib/actions/auth.action";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Logout button component
 * @returns Logout button component
 */
export function LogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await signOut();

      if (result.success) {
        // Redirect to login page or home page after logout
        toast.success("Logged out successfully");
        router.push("/sign-in"); // Adjust the redirect path as needed
      } else {
        // Handle logout failure
        console.error(result.message);
        toast.error("Logout failed");
      }
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isLoading}
      className={cn(
        "relative overflow-hidden group cursor-pointer",
        "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800",
        "text-white font-medium",
        "transition-all duration-300 ease-in-out",
        "border-0 shadow-md hover:shadow-lg",
        "flex items-center gap-2 px-4 py-1 h-10"
      )}
    >
      <span className="relative z-10 flex items-center gap-2">
        <LogOut
          size={18}
          className="group-hover:translate-x-1 transition-transform duration-300"
        />
        <span>{isLoading ? "Logging out..." : "Logout"}</span>
      </span>
      <span className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
    </Button>
  );
}
