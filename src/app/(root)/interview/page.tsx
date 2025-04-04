/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
import Agent from "@/components/base/interview/agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import React from "react";

const InterviewPage = async () => {
  const user = await getCurrentUser();
  return (
    <>
      <h3>Interview Generation</h3>
      <Agent userName={user?.name!} userId={user?.id} type="generate" />
    </>
  );
};

export default InterviewPage;
