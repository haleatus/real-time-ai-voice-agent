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
    // Validate transcript length and content
    if (!transcript || transcript.length < 4) {
      return {
        success: false,
        error: "Interview too short to generate meaningful feedback",
      };
    }

    // Count meaningful user messages (excluding system/assistant messages)
    const userMessageCount = transcript.filter(
      (msg) => msg.role === "user" && msg.content.trim().length > 0
    ).length;

    // Require at least 3 meaningful user messages
    if (userMessageCount < 3) {
      return {
        success: false,
        error: "Not enough user interaction to generate feedback",
      };
    }

    // Format the transcript
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
        You are an AI interviewer analyzing a mock interview. 
        IMPORTANT: If the interview is very brief or lacks substantial content, do not generate a full score.
        
        Transcript:
        ${formattedTranscript}

        Please carefully evaluate the candidate. If there is insufficient information, indicate this in the assessment.
        Score the candidate from 0 to 100 in these areas:
        - **Communication Skills**: Clarity, articulation, structured responses.
        - **Technical Knowledge**: Understanding of key concepts for the role.
        - **Problem-Solving**: Ability to analyze problems and propose solutions.
        - **Cultural & Role Fit**: Alignment with company values and job role.
        - **Confidence & Clarity**: Confidence in responses, engagement, and clarity.
        `,
      system:
        "You are a professional interviewer analyzing a mock interview. Provide a fair and thorough assessment based on available information.",
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

  try {
    // Try querying with both interviewId and userId
    const feedbackQuery = await db
      .collection("feedback")
      .where("interviewId", "==", interviewId)
      .where("userId", "==", userId)
      .limit(1)
      .get();

    // If no feedback found, try querying just by interviewId
    if (feedbackQuery.empty) {
      const fallbackQuery = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        .limit(1)
        .get();

      if (fallbackQuery.empty) return null;

      const fallbackDoc = fallbackQuery.docs[0];
      return { id: fallbackDoc.id, ...fallbackDoc.data() } as Feedback;
    }

    // Get the feedback document
    const feedbackDoc = feedbackQuery.docs[0];

    // Return the feedback
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
  } catch (error) {
    console.error("Error fetching feedback:", error);
    return null;
  }
}
