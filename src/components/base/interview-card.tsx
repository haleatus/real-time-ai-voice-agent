import React from "react";

// Importing dayjs
import dayjs from "dayjs";
import Image from "next/image";
import { getRandomInterviewCover } from "@/lib/utils";
import { Button } from "../ui/button";
import Link from "next/link";
import DisplayTechIcons from "./display-tech-icons";
import { Calendar, Star } from "lucide-react";

// Interface for InterviewCardProps
interface InterviewCardProps {
  id: string;
  userId: string;
  role: string;
  type: string;
  techstack: string[];
  createdAt: string;
}

const InterviewCard = ({
  id: interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
}: InterviewCardProps) => {
  const feedback = null as Feedback | null;
  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-80">
      <div className="card-interview">
        <div>
          <div className="absolute top-0 right-0 w-fit px-3 py-2 rounded-bl-md bg-white/5 border">
            <p className="badge-text">{normalizedType}</p>
          </div>

          <Image
            src={getRandomInterviewCover()}
            alt={`cover-image for user ${userId}`}
            width={42}
            height={42}
            className="rounded-full object-fit size-[42px]"
          />

          <h3 className="mt-3 capitalize font-mona-sans">{role} Interview</h3>

          <div className="flex flex-row gap-5 mt-3">
            <div className="flex items-center gap-1 text-sm font-medium text-sky-400">
              <Calendar size={16} />
              <p className="text-base text-gray-500">{formattedDate}</p>
            </div>

            <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
              <Star size={18} className="text-yellow-500" />
              <span className="text-base">{feedback?.totalScore ?? "---"}</span>
              <span className="text-gray-500">/ 100</span>
            </div>
          </div>

          <p className="line-clamp-2 mt-4 text-sm text-gray-500">
            {feedback?.finalAssessment ||
              "You haven't taken the interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          <Link
            href={
              feedback
                ? `/interview/${interviewId}/feedback`
                : `/interview/${interviewId}`
            }
          >
            <Button className="btn-primary">
              {feedback ? "Check Feedback" : "View Interview"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
