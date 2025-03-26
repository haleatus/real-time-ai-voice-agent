import React, { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return <main className="auth-layout">{children}</main>;
};

export default AuthLayout;
