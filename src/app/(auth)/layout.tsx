// Actions import
import { isAuthenticated } from "@/lib/actions/auth.action";

// Next imports
import { redirect } from "next/navigation";

// React imports
import React, { ReactNode } from "react";

/**
 * AuthLayout component
 * @param children
 * @returns AuthLayout component
 */
const AuthLayout = async ({ children }: { children: ReactNode }) => {
  // Check if the user is authenticated
  const isUserAuthenticated = await isAuthenticated();

  // Redirect the user to the home page if authenticated
  if (isUserAuthenticated) redirect("/");

  // Return the auth layout
  return <main className="auth-layout">{children}</main>;
};

export default AuthLayout;
