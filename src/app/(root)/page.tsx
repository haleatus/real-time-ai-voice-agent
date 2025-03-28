/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
// React imports
import Image from "next/image";
import Link from "next/link";
import React from "react";

// UI imports
import InterviewCard from "@/components/base/interview-card";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/actions/auth.action";

// Action imports
import {
  getInterviewsByUserId,
  getLatestInterviews,
} from "@/lib/actions/interview.action";

/**
 * Landing page for the user
 * @returns Landing page for the user
 */
const LandingPage = async () => {
  // Get the current user
  const user = await getCurrentUser();

  // Parallelize the fetching of user interviews and latest interviews
  const [userInterviews, latestInterviews] = await Promise.all([
    getInterviewsByUserId(user?.id!),
    getLatestInterviews({ userId: user?.id! }),
  ]);

  console.log("u", userInterviews);
  console.log(latestInterviews);

  // Check if the user has past interviews
  const hasPastInterviews = (userInterviews?.length ?? 0) > 0;

  // Check if there are upcoming interviews
  const hasUpcomingInterviews = (latestInterviews?.length ?? 0) > 0;
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2 className="">
            Get Interview-Ready with AI powered practice & Feedback
          </h2>
          <p className="text-lg">
            Practice on real interview questions and get instant feedback on
            your answers.
          </p>

          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
          style={{ transform: "scaleX(-1)" }}
        />
      </section>
      <section className="flex flex-col mt-4 gap-6">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet.</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-4">
        <h2>Other User&apos;s Interviews</h2>

        <div className="interviews-section">
          {hasUpcomingInterviews ? (
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no new interviews available.</p>
          )}
        </div>
      </section>
    </>
  );
};

export default LandingPage;
