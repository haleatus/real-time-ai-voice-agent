"use server";

// Ai imports
import { generateObject } from "ai";

// Google imports
import { google } from "@ai-sdk/google";

// Firebase imports
import { db } from "@/firebase/admin";

// Constants imports
import { feedbackSchema } from "@/constants";

/**
 * Create feedback parameters
 * @param interviewId
 * @param userId
 * @param transcript
 * @param feedbackId
 * @returns Create feedback parameters
 */
export async function createFeedback(params: CreateFeedbackParams) {
  // Destruct the parameters
  const { interviewId, userId, transcript, feedbackId } = params;

  try {
    // Format the transcript
    /**
     * The formatted transcript will look like this:
     * - user: Hello, how are you?
     * - system/assistant: I'm good, thank you.
     * - user: That's great to hear.
     * - system/assistant: Yes, it is.
     */
    const formattedTranscript = transcript
      .map(
        (sentence: { role: string; content: string }) =>
          `- ${sentence.role}: ${sentence.content}\n`
      )
      .join("");

    // Generate feedback object using the AI model -> google("gemini-2.0-flash-001")
    const { object } = await generateObject({
      model: google("gemini-2.0-flash-001", {
        structuredOutputs: false,
      }),
      schema: feedbackSchema,
      prompt: `
        You are an AI interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories. Be thorough and detailed in your analysis. Don't be lenient with the candidate. If there are mistakes or areas for improvement, point them out.
        Transcript:
        ${formattedTranscript}

        Please score the candidate from 0 to 100 in the following areas. Do not add categories other than the ones provided:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Your task is to evaluate the candidate based on structured categories",
    });

    // Feedback object
    const feedback = {
      interviewId: interviewId,
      userId: userId,
      totalScore: object.totalScore,
      categoryScores: object.categoryScores,
      strengths: object.strengths,
      areasForImprovement: object.areasForImprovement,
      finalAssessment: object.finalAssessment,
      createdAt: new Date().toISOString(),
    };

    // Reference to the feedback
    let feedbackRef;

    // If feedback ID is provided, use it to update the feedback else create a new feedback
    if (feedbackId) {
      feedbackRef = db.collection("feedback").doc(feedbackId);
    } else {
      feedbackRef = db.collection("feedback").doc();
    }

    // Save the feedback to the database
    await feedbackRef.set(feedback);

    // Return the feedback ID
    return { success: true, feedbackId: feedbackRef.id };
  } catch (error) {
    // Console log the error
    console.error("Error saving feedback:", error);
    // Return an error message
    return { success: false };
  }
}

/**
 * Get feedback by interview ID parameters
 * @param params
 * @returns Feedback
 */
export async function getFeedbackByInterviewId(
  params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
  // Destruct the parameters
  const { interviewId, userId } = params;

  // Get the feedback by interview ID and user ID
  const feedback = await db
    .collection("feedback")
    .where("interviewId", "==", interviewId)
    .where("userId", "==", userId)
    .limit(1)
    .get();

  // If feedback is empty, return null
  if (feedback.empty) return null;

  // Get the feedback document
  const feedbackDoc = feedback.docs[0];

  // Return the feedback
  return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}
