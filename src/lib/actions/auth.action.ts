/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

// Firebase imports
import { auth, db } from "@/firebase/admin";

// Next cookies
import { cookies } from "next/headers";

// One week
const ONE_WEEK = 60 * 60 * 24 * 7;

/**
 * Sign up action
 * @param params
 * @returns Sign up result
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

    return {
      success: true,
      message: "User created successfully.",
    };
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

/**
 * Sign in action
 * @param params
 * @returns Sign in result
 */
export async function signIn(params: SignInParams) {
  // Destruct the parameters
  const { email, idToken } = params;

  try {
    // Get access to the user
    const userRecord = await auth.getUserByEmail(email);

    // If the user does not exists, return an error message
    if (!userRecord) {
      return {
        success: false,
        message: "User does not exists. Create and account instead.",
      };
    }

    // If the user exists, set the session cookie
    await setSessionCookie(idToken);

    return {
      success: true,
      message: "User signed in successfully.",
    };
  } catch (error: any) {
    // Log the error
    console.error("Error signing in a user", error);
    // Return an error message
    return {
      success: false,
      message: "Failed to log in to an account.",
    };
  }
}

/**
 * setSessionCookie action
 * @param params
 * @returns Set session cookie
 */
export async function setSessionCookie(idToken: string) {
  // store the cookie
  const cookieStore = await cookies();

  // create a session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: ONE_WEEK * 1000, // in milliseconds
  });

  // set the cookie
  cookieStore.set("session", sessionCookie, {
    maxAge: ONE_WEEK,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
}

/**
 * Sign out action
 * @returns {Promise} Promise object represents the current user
 */
export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();

  // Get the session cookie
  const sessionCookie = cookieStore.get("session")?.value;

  // If the session cookie does not exist, return null
  if (!sessionCookie) {
    return null;
  }

  try {
    // Verify the session cookie
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    // Get the user record
    const userRecord = await db
      .collection("users")
      .doc(decodedClaims.uid)
      .get();

    // If the user record does not exist, return null
    if (!userRecord.exists) {
      return null;
    }

    // Return the user data
    return {
      ...userRecord.data(),
      id: userRecord.id,
    } as User;
  } catch (error) {
    // Log the error
    console.log(error);
    // Return null
    return null;
  }
}

/**
 * Sign out action
 * @returns Returns true or false if the user is authenticated
 */
export async function isAuthenticated() {
  const user = await getCurrentUser();
  return !!user; // return true if user is authenticated and false if not (truthy and falsy values)
}
