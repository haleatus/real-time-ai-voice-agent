/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Types and icons
import { Star, Calendar, Sparkles, TrendingUp, Target } from "lucide-react";
import dayjs from "dayjs";

// Prop types for the component
interface FeedbackComponentProps {
  id: string;
  interview: Interview;
  feedback: Feedback | null;
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
  id,
  interview,
  feedback,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-2 py-4"
    >
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-3xl font-bold">
              Interview Feedback -{" "}
              <span className="text-primary">{interview.role}</span>
            </CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline">
                    <Star className="mr-2 h-4 w-4" />
                    Overall Score
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>Your total performance score</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>

        <CardContent>
          {/* Header Info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-between items-center mb-6 p-4 bg-muted rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <Star className="text-yellow-500" />
              <span className="text-xl font-semibold">
                Overall Score:{" "}
                <span className="text-primary">{feedback?.totalScore}/100</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {feedback?.createdAt
                  ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                  : "N/A"}
              </span>
            </div>
          </motion.div>

          {/* Final Assessment */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold mb-3 flex items-center">
              <Sparkles className="mr-2 text-primary" />
              Final Assessment
            </h2>
            <p className="text-muted-foreground">{feedback?.finalAssessment}</p>
          </motion.section>

          {/* Interview Breakdown */}
          <motion.section
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6"
          >
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Target className="mr-2 text-primary" />
              Interview Breakdown
            </h2>
            {feedback?.categoryScores?.map(
              (
                category: { name: string; score: number; comment: string },
                index: number
              ) => (
                <div
                  key={index}
                  className="mb-4 p-3 bg-background border rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold">
                      {index + 1}. {category.name}
                    </span>
                    <Badge variant="secondary">{category.score}/100</Badge>
                  </div>
                  <p className="text-muted-foreground">{category.comment}</p>
                </div>
              )
            )}
          </motion.section>

          {/* Strengths and Improvements */}
          <div className="grid md:grid-cols-2 gap-6">
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-green-500" />
                Strengths
              </h3>
              <ul className="space-y-2 list-disc pl-5">
                {feedback?.strengths?.map((strength, index) => (
                  <li key={index} className="text-muted-foreground">
                    {strength}
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="mr-2 text-red-500 rotate-180" />
                Areas for Improvement
              </h3>
              <ul className="space-y-2 list-disc pl-5">
                {feedback?.areasForImprovement?.map((area, index) => (
                  <li key={index} className="text-muted-foreground">
                    {area}
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex space-x-4 mt-8"
          >
            <Button variant="secondary" className="flex-1">
              <Link href="/" className="w-full text-center">
                Back to Dashboard
              </Link>
            </Button>
            <Button className="flex-1">
              <Link href={`/interview/${id}`} className="w-full text-center">
                Retake Interview
              </Link>
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeedbackComponent;
