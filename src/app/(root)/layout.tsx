// Next imports
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

// React imports
import React, { ReactNode } from "react";

// Action imports
import { isAuthenticated } from "@/lib/actions/auth.action";

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
      <nav>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="logo" width={32} height={32} />
          <h2>Prepme</h2>
        </Link>
      </nav>
      {children}
    </main>
  );
};

export default RootLayout;
