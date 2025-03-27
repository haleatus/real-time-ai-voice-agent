"use client";

// React imports
import React, { useState } from "react";
import { useRouter } from "next/navigation";

// UI imports
import { Button } from "@/components/ui/button";

// Actions imports
import { signOut } from "@/lib/actions/auth.action";
import { toast } from "sonner";

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
      variant="destructive"
      className="cursor-pointer"
    >
      {isLoading ? "Logging out..." : "Logout"}
    </Button>
  );
}
