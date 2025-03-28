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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            onClick={handleLogout}
            disabled={isLoading}
            className={cn(
              "relative overflow-hidden group cursor-pointer rounded-full",
              "bg-black hover:bg-red-700",
              "text-white font-medium",
              "transition-all duration-300 ease-in-out",
              "border-2 border-red-500/50 shadow-md hover:shadow-lg",
              "flex items-center size-9"
            )}
          >
            <span className="relative z-10 flex items-center">
              <LogOut
                size={18}
                className="group-hover:translate-x-0.5 transition-transform duration-300"
              />
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <span className="text-md fon-semibold font-mona-sans">
            {isLoading ? "Logging out..." : "Logout"}
          </span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
