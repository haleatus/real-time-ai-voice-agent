"use client";

import React, { useState } from "react";

// Zod and react-hook-form imports
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// UI components imports
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import FormField from "../form-field";

// Firebase imports
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  AuthError,
} from "firebase/auth";
import { auth } from "@/firebase/client";

// action imports
import { signIn, signUp } from "@/lib/actions/auth.action";

// Zod schema for form validation
const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().nonempty().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  });
};

// Function to map Firebase error codes to user-friendly messages
const getFirebaseErrorMessage = (error: AuthError) => {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please try again.";
    case "auth/user-not-found":
      return "No user found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "This email is already registered. Please use a different email or sign in.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/network-request-failed":
      return "Network error. Please check your internet connection.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

/**
 * AuthForm component
 * @param type - Type of form (sign-in or sign-up)
 * @returns AuthForm component
 */
const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formSchema = authFormSchema(type);

  // 1. Define the form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Prevent multiple submissions
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (type === "sign-in") {
        const { email, password } = values;

        // Sign in the user
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Get the user's ID token
        const idToken = await userCredentials.user.getIdToken();

        // Check if the sign in was successful
        if (!idToken) {
          toast.error("Sign in failed");
          return;
        }

        // Sign in the user
        await signIn({
          email,
          idToken,
        });

        // Show a success message
        toast.success(
          `You have successfully signed in. Welcome, ${userCredentials.user.email}!`
        );

        // Redirect the user
        router.push("/");
      } else {
        const { name, email, password } = values;

        // Create a new user
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        // Sign up the user
        const result = await signUp({
          uid: userCredentials.user.uid,
          name: name!,
          email,
          password,
        });

        // Check if the sign up was successful
        if (!result?.success) {
          toast.error(result?.message || "Sign up failed");
          return;
        }

        // Show a success message
        toast.success(`You have successfully signed up. Welcome, ${name}!`);

        // Redirect the user
        router.push("/sign-in");
      }
    } catch (error) {
      // Handle Firebase authentication errors
      if (error instanceof Error) {
        const firebaseError = error as AuthError;
        const errorMessage = getFirebaseErrorMessage(firebaseError);
        toast.error(errorMessage);

        // Log the full error for debugging
        console.error("Authentication Error:", firebaseError);
      } else {
        toast.error("An unexpected error occurred");
      }
    } finally {
      // Always reset submitting state
      setIsSubmitting(false);
    }
  }

  // Check the form type
  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-4 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="Logo" width={38} height={32} />
          <h2 className="text-primary-100">Prepme</h2>
        </div>
        <h3 className="text-center text-sm">Practice job interview with AI</h3>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-6 mt-4 form"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
                disabled={isSubmitting}
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
              disabled={isSubmitting}
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Your Password"
              disabled={isSubmitting}
            />
            <Button type="submit" className="btn" disabled={isSubmitting}>
              {isSubmitting
                ? isSignIn
                  ? "Signing In..."
                  : "Creating Account..."
                : isSignIn
                ? "Sign In"
                : "Create An Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {" "}
          {isSignIn ? "Don't have an account?" : "Already have and account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
            {...(isSubmitting ? { "aria-disabled": true } : {})}
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
