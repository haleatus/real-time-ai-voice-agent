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
import { cn } from "@/lib/utils";

// Zod schema for form validation
const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().nonempty().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  });
};

// Custom error handling function
const handleFirebaseError = (error: AuthError) => {
  switch (error.code) {
    case "auth/invalid-credential":
      return "Invalid email or password. Please check and try again.";
    case "auth/invalid-email":
      return "Invalid email address format.";
    case "auth/user-disabled":
      return "This user account has been disabled.";
    case "auth/user-not-found":
      return "No user found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/email-already-in-use":
      return "Email address is already registered.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/network-request-failed":
      return "Network error. Please check your connection.";
    case "auth/too-many-requests":
      return "Too many login attempts. Please try again later.";
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
  const [formError, setFormError] = useState<string | null>(null);
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
    // Reset previous form errors
    setFormError(null);

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
          const errorMessage = "Sign in failed";
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        // Sign in the user
        await signIn({
          email,
          idToken,
        });

        // Show a success message
        toast.success(`You have successfully signed in. Redirecting...`);

        setIsSubmitting(false);

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
          const errorMessage = result?.message || "Sign up failed";
          setFormError(errorMessage);
          toast.error(errorMessage);
          return;
        }

        // Show a success message
        toast.success(`You have successfully signed up. Redirecting...`);

        setIsSubmitting(false);

        // Redirect the user
        router.push("/sign-in");
      }
    } catch (error) {
      // Check if error is an AuthError
      if (error instanceof Error) {
        const authError = error as AuthError;
        const errorMessage = handleFirebaseError(authError);

        // Set form-level error
        setFormError(errorMessage);

        // Show toast notification
        toast.error(errorMessage);

        setIsSubmitting(false);
        // Log the full error for debugging
        // console.error("Authentication Error:", authError);
      } else {
        const errorMessage = "An unexpected error occurred";
        setFormError(errorMessage);

        toast.error(errorMessage);

        setIsSubmitting(false);
        // Log the full error for debugging
        // console.error(error);
      }
    }
  }

  // Check the form type
  const isSignIn = type === "sign-in";

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={cn(
          "flex flex-col space-y-6 p-8 bg-gradient-to-b from-transparent to-sky-500/20 backdrop-blur-3xl rounded-xl shadow-sm border border-gray-100/20",
          isSubmitting && "opacity-50 pointer-events-none"
        )}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Logo"
              width={28}
              height={24}
              className="h-6 w-auto"
            />
            <h2 className="text-xl font-semibold text-white">VirtIQ</h2>
          </div>
          <p className="text-sm text-gray-500">
            Practice job interviews with AI
          </p>
        </div>

        {/* Display form-level error message */}
        {formError && (
          <div
            className="border border-red-500 backdrop-blur-3xl text-red-600 text-[13px] font-mona-sans flex justify-center px-4 py-1 rounded-md"
            role="alert"
          >
            {formError}
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full space-y-3"
          >
            {!isSignIn && (
              <FormField
                control={form.control}
                name="name"
                label="Name"
                placeholder="Your Name"
              />
            )}
            <FormField
              control={form.control}
              name="email"
              label="Email"
              placeholder="Your email address"
              type="email"
            />
            <FormField
              control={form.control}
              name="password"
              label="Password"
              type="password"
              placeholder="Your Password"
              showStrengthMeter={!isSignIn}
            />
            <Button
              type="submit"
              className="w-full mt-2 cursor-pointer"
              disabled={isSubmitting}
            >
              {isSignIn ? "Sign In" : "Create An Account"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-sm text-gray-500">
          {isSignIn ? "Don't have an account?" : "Already have an account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-medium text-primary ml-1 hover:underline transition-colors"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
