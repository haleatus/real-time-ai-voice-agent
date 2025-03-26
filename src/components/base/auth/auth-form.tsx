"use client";

import React from "react";

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

// Zod schema for form validation
const authFormSchema = (type: FormType) => {
  return z.object({
    name:
      type === "sign-up" ? z.string().nonempty().min(3) : z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
  });
};

/**
 * AuthForm component
 * @param type - Type of form (sign-in or sign-up)
 * @returns AuthForm component
 */
const AuthForm = ({ type }: { type: FormType }) => {
  const router = useRouter();

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
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (type === "sign-in") {
        console.log("Sign-in values", values);
      } else {
        console.log("Sign-up values", values);
      }
      toast.success(
        `You have successfully ${
          type === "sign-in" ? "signed in" : "signed up"
        }`
      );
      router.push(isSignIn ? "/" : "/sign-in");
    } catch (error) {
      console.log(error);
      toast.error(`There was an error: ${error}`);
    }
  }

  const isSignIn = type === "sign-in";

  return (
    <div className="card-border lg:min-w-[566px]">
      <div className="flex flex-col gap-4 card py-14 px-10">
        <div className="flex flex-row gap-2 justify-center">
          <Image src="/logo.svg" alt="Logo" width={38} height={32} />
          <h2 className="text-primary-100">Prepme</h2>
        </div>
        <h3>Practice job interview with AI</h3>

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
            />
            <Button type="submit" className="btn">
              {isSignIn ? "Sign In" : "Create An Account"}
            </Button>
          </form>
        </Form>
        <p className="text-center">
          {" "}
          {isSignIn ? "Don't have an account?" : "Already have and account?"}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-bold text-user-primary ml-1"
          >
            {!isSignIn ? "Sign In" : "Sign Up"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AuthForm;
