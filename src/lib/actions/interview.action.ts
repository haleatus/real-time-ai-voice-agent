"use server";

// Firebase imports
import { db } from "@/firebase/admin";

/**
 * Interview interface
 * @param userId
 * @returns Interview list created by the user
 */
export async function getInterviewsByUserId(
  userId: string
): Promise<Interview[] | null> {
  // Check if userId is undefined or null
  if (!userId) {
    console.warn("No user ID provided for interview query");
    return null;
  }

  try {
    const interviews = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching interview by userid:", error);
    return null;
  }
}

/**
 * Interview interface
 * @param userId
 * @returns Latest Interview list created by the users
 */
export async function getLatestInterviews(
  params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
  const { userId, limit = 20 } = params;

  // Additional check to handle undefined or null userId
  if (!userId) {
    console.warn("No user ID provided for latest interviews query");
    return null;
  }

  try {
    const interviews = await db
      .collection("interviews")
      .orderBy("createdAt", "desc")
      .where("finalized", "==", true)
      .where("userId", "!=", userId)
      .limit(limit)
      .get();

    return interviews.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Interview[];
  } catch (error) {
    console.error("Error fetching latest interviews:", error);
    return null;
  }
}

/**
 * Interview detail by id
 * @param id
 * @returns Interview detail by id
 */
export async function getInterviewById(id: string): Promise<Interview | null> {
  const interview = await db.collection("interviews").doc(id).get();

  return interview.data() as Interview | null;
}
