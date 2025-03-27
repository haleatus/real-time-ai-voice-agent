/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */

// Next.js imports
import { redirect } from "next/navigation";

// Action imports
import { getInterviewById } from "@/lib/actions/interview.action";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback.action";
import { getCurrentUser } from "@/lib/actions/auth.action";

// Component imports
import FeedbackComponent from "@/components/base/interview/feedback";

/**
 * Feedback page
 * @param id - Interview ID
 * @returns Feedback page
 */
const FeedbackPage = async ({ params }: RouteParams) => {
  // Get interview id
  const { id } = await params;

  // Get currentUser
  const user = await getCurrentUser();

  // Get interview
  const interview = await getInterviewById(id);

  // Redirect to home page if interview is not found
  if (!interview) redirect("/");

  // Get feedback by interview id
  const feedback = await getFeedbackByInterviewId({
    interviewId: id,
    userId: user?.id!,
  });

  return (
    <FeedbackComponent id={id} interview={interview} feedback={feedback} />
  );
};

export default FeedbackPage;
