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
import Link from "next/link";

// Action imports
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getFeedbackByInterviewId } from "@/lib/actions/feedback.action";

// UI imports
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Icons
import { Calendar, ExternalLinkIcon } from "lucide-react";

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
      <Card className="w-full hover:shadow-md transition-shadow p-0 bg-dark-200/5 backdrop-blur-2xl">
        <CardContent className="px-4 py-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
            <div className="space-y-2 w-full">
              {/* Interview header */}
              <div className="flex items-center w-full justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src={getRandomInterviewCover() || "/placeholder.svg"}
                    alt="Interview cover"
                    width={48}
                    height={48}
                    className="rounded-full object-cover size-12 border"
                  />

                  <h3 className="font-semibold text-lg capitalize">
                    {interview.role} Interview
                  </h3>
                  <div>
                    {/* Tech stack */}
                    <DisplayTechIcons techStack={interview.techstack} />
                  </div>
                </div>
                <Badge variant="outline" className="mt-1">
                  {interview.type}
                </Badge>
              </div>

              {/* Feedback section */}
              {feedback && (
                <div className="mt-2 pt-2 border-t flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    Feedback given on{" "}
                    <span className="text-sky-500">
                      {new Date(feedback.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <Link
                    href={`/interview/${id}/feedback`}
                    className="text-sm mt-1 text-sky-500 inline-flex items-center hover:underline"
                  >
                    View Feedback
                    <ExternalLinkIcon className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
