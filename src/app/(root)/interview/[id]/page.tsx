/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
// Action imports
import DisplayTechIcons from "@/components/base/display-tech-icons";
import { getInterviewById } from "@/lib/actions/interview.action";

// UI imports
import Agent from "@/components/base/interview/agent";

// Utils imports
import { getRandomInterviewCover } from "@/lib/utils";

// Next.js imports
import { redirect } from "next/navigation";
import React from "react";
import Image from "next/image";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback.action";

/**
 * Interview detail page
 * @param params
 * @returns Interview detail page
 */
const InterviewDetailPage = async ({ params }: RouteParams) => {
  // Get interview id
  const { id } = await params;

  // Get current user
  const user = await getCurrentUser();

  // Get interview by id
  const interview = await getInterviewById(id);

  // Redirect to home page if interview is not found
  if (!interview) redirect("/");

  // Get feedback by interview id
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  // Return interview detail page
  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={user?.name || ""}
        userId={user?.id}
        interviewId={id}
        type="interview"
        questions={interview.questions}
        feedbackId={feedback?.id}
      />
    </>
  );
};

export default InterviewDetailPage;
