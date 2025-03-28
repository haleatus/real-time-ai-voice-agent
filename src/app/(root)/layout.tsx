// Next imports
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// React imports
import React, { ReactNode } from "react";

// Action imports
import { isAuthenticated } from "@/lib/actions/auth.action";

// Component imports
import { LogoutButton } from "@/components/base/auth/logout-button";

/**
 * RootLayout component
 * @param children - Children components
 * @returns RootLayout component
 */
const RootLayout = async ({ children }: { children: ReactNode }) => {
  // Check if the user is authenticated
  const isUserAuthenticated = await isAuthenticated();

  // Redirect the user to the sign-in page if not authenticated
  if (!isUserAuthenticated) redirect("/sign-in");

  // Return the root layout
  return (
    <main className="root-layout">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <h2 className="text-[24px] font-semi-bold hover:text-orange-400 transition-colors duration-300">
            VirtIQ
          </h2>
        </Link>
        <LogoutButton />
      </nav>
      {children}
    </main>
  );
};

export default RootLayout;
