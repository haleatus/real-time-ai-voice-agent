"use client";

import type React from "react";
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
import { Progress } from "@/components/ui/progress";

// Types and icons
import {
  Star,
  Calendar,
  Sparkles,
  TrendingUp,
  Target,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import dayjs from "dayjs";

// Prop types for the component
interface FeedbackComponentProps {
  id: string;
  interview: Interview;
  feedback: Feedback | null;
}

// Define the Interview and Feedback types
interface Interview {
  role: string;
  // Add other properties of the Interview type here
}

interface Feedback {
  createdAt: string;
  totalScore: number;
  finalAssessment: string;
  categoryScores: { name: string; score: number; comment: string }[];
  strengths: string[];
  areasForImprovement: string[];
  // Add other properties of the Feedback type here
}

const FeedbackComponent: React.FC<FeedbackComponentProps> = ({
  id,
  interview,
  feedback,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-background to-background/50 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <Card className="w-full max-w-4xl mx-auto border-none shadow-lg overflow-hidden">
          <CardHeader className="bg-primary/5 pb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <CardTitle className="text-2xl md:text-3xl font-bold">
                  <span className="text-primary capitalize">
                    {interview.role}
                  </span>{" "}
                  Interview Feedback
                </CardTitle>
                <p className="text-muted-foreground mt-1 text-sm flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {feedback?.createdAt
                    ? dayjs(feedback.createdAt).format("MMM D, YYYY h:mm A")
                    : "N/A"}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center bg-background rounded-full px-4 py-2 shadow-sm"
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        </div>
                        <span className="font-bold text-xl">
                          {feedback?.totalScore || 0}
                        </span>
                        <span className="text-muted-foreground text-sm">
                          /100
                        </span>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your overall performance score</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              {/* Final Assessment */}
              <motion.section variants={itemVariants} className="space-y-3">
                <h2 className="text-xl font-semibold flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary" />
                  Final Assessment
                </h2>
                <Card className="bg-primary/5 border-none p-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {feedback?.finalAssessment}
                  </p>
                </Card>
              </motion.section>

              {/* Interview Breakdown */}
              <motion.section variants={itemVariants} className="space-y-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Target className="mr-2 h-5 w-5 text-primary" />
                  Interview Breakdown
                </h2>

                <div className="space-y-4">
                  {feedback?.categoryScores?.map(
                    (
                      category: {
                        name: string;
                        score: number;
                        comment: string;
                      },
                      index: number
                    ) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 * index }}
                        className="p-4 bg-card border border-border/50 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                          <span className="font-medium text-lg">
                            {category.name}
                          </span>
                          <Badge variant="secondary" className="px-3 py-1">
                            {category.score}/100
                          </Badge>
                        </div>
                        <Progress
                          value={category.score}
                          className="h-1.5 mb-3"
                        />
                        <p className="text-muted-foreground text-sm">
                          {category.comment}
                        </p>
                      </motion.div>
                    )
                  )}
                </div>
              </motion.section>

              {/* Strengths and Improvements */}
              <motion.div
                variants={itemVariants}
                className="grid md:grid-cols-2 gap-6"
              >
                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-emerald-500" />
                    Strengths
                  </h3>
                  <Card className="bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/20 p-4">
                    <ul className="space-y-2">
                      {feedback?.strengths?.map((strength, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-emerald-500 mt-1">•</span>
                          <span>{strength}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </Card>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-rose-500 rotate-180" />
                    Areas for Improvement
                  </h3>
                  <Card className="bg-rose-50/30 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/20 p-4">
                    <ul className="space-y-2">
                      {feedback?.areasForImprovement?.map((area, index) => (
                        <motion.li
                          key={index}
                          initial={{ opacity: 0, x: -5 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.1 * index }}
                          className="flex items-start gap-2 text-muted-foreground"
                        >
                          <span className="text-rose-500 mt-1">•</span>
                          <span>{area}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </Card>
                </section>
              </motion.div>

              {/* Action Buttons */}
              <motion.div
                variants={itemVariants}
                className="flex flex-col sm:flex-row gap-3 pt-4"
              >
                <Button variant="outline" className="flex-1 gap-2 group">
                  <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                  <Link href="/" className="w-full text-center">
                    Back to Dashboard
                  </Link>
                </Button>
                <Button className="flex-1 gap-2 group">
                  <Link
                    href={`/interview/${id}`}
                    className="w-full text-center flex items-center justify-center gap-2"
                  >
                    Retake Interview
                    <RefreshCw className="h-4 w-4 group-hover:rotate-90 transition-transform" />
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default FeedbackComponent;
