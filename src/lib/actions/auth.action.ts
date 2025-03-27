/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "@/firebase/admin";

/**
 * Sign up parameters
 * @param params
 * @returns {Promise} Promise object represents the result of the sign up
 */
export async function signUp(params: SignUpParams) {
  // Destruct the parameters
  const { uid, name, email } = params;

  try {
    // Check if the user already exists
    const userRecord = await db.collection("users").doc(uid).get();

    // If the user exists, return an error message
    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists.",
      };
    }

    // Create a new user
    await db.collection("users").doc(uid).set({
      name,
      email,
    });
  } catch (error: any) {
    // Log the error
    console.error("Error creating a user", error);

    // Firebase error handling
    if (error.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "Email already exists.",
      };
    }

    // Return an error message
    return {
      success: false,
      message: "Failed to create an account.",
    };
  }
}
