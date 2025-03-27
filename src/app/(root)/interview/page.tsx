import Agent from "@/components/base/interview/agent";
import React from "react";

const InterviewPage = () => {
  return (
    <>
      <h3>Interview Generation</h3>
      <Agent userName="You" userId="u1" type="generate" />
    </>
  );
};

export default InterviewPage;
