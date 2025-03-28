"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EyeIcon, EyeOffIcon, CheckCircle2, XCircle } from "lucide-react";
import {
  type Control,
  Controller,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { cn } from "@/lib/utils";

// Password strength calculation
const calculatePasswordStrength = (password: string) => {
  if (!password) return 0;

  // Initialize strength and requirements
  let strength = 0;
  const requirements = {
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    specialChars: false,
  };

  // Length check (critical factor)
  if (password.length >= 8) {
    requirements.length = true;
    strength += 20; // Base points for meeting minimum length
  }
  if (password.length >= 12) strength += 10; // Bonus for longer passwords
  if (password.length >= 16) strength += 10; // Additional bonus for very long passwords

  // Character type checks
  const charTypes = {
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /[0-9]/.test(password),
    specialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };

  // Update requirements and add strength points
  Object.entries(charTypes).forEach(([type, hasType]) => {
    if (hasType) {
      requirements[type as keyof typeof requirements] = true;
      strength += 15; // Points for each character type
    }
  });

  // Bonus for multiple character types
  const typesUsed = Object.values(charTypes).filter(Boolean).length;
  if (typesUsed >= 3) strength += 10; // Bonus for diversity
  if (typesUsed === 4) strength += 10; // Maximum diversity bonus

  // Entropy-based approach (penalize predictable patterns)
  const entropyPenalties = [
    /^[a-zA-Z]+$/, // Only letters
    /^[0-9]+$/, // Only numbers
    /(.)\1{2,}/, // Repeated characters
    /^(123|abc|qwe)/i, // Common sequences
    /password|123456|qwerty/i, // Common weak passwords
  ];

  entropyPenalties.forEach((pattern) => {
    if (pattern.test(password)) strength -= 20;
  });

  // Ensure password is within 0-100 range
  return Math.min(Math.max(Math.round(strength), 0), 100);
};

// Password requirements check
const checkPasswordRequirements = (password: string) => {
  return {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  };
};

// FormField props
interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
  showStrengthMeter?: boolean;
}

/**
 * FormField component
 * @returns FormField component with password visibility and strength
 */
const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type,
  showStrengthMeter = false,
}: FormFieldProps<T>) => {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [requirements, setRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [isAnimating, setIsAnimating] = useState(false);

  // Get strength level and corresponding styles
  const getStrengthLevel = (strength: number) => {
    if (strength === 0) return { level: "Nope", color: "bg-gray-200" };
    if (strength < 25) return { level: "Very Weak", color: "bg-red-600" };
    if (strength < 50) return { level: "Weak", color: "bg-red-500" };
    if (strength < 70) return { level: "Moderate", color: "bg-orange-500" };
    if (strength < 90) return { level: "Strong", color: "bg-green-500" };
    return { level: "Very Strong", color: "bg-emerald-500" };
  };

  // Trigger animation when strength changes
  useEffect(() => {
    if (passwordStrength > 0) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 600);
      return () => clearTimeout(timer);
    }
  }, [passwordStrength]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState: { error } }) => {
        const handlePasswordChange = (
          e: React.ChangeEvent<HTMLInputElement>
        ) => {
          field.onChange(e);
          if (type === "password") {
            const value = e.target.value;
            setPasswordStrength(calculatePasswordStrength(value));
            setRequirements(checkPasswordRequirements(value));
          }
        };

        const strengthInfo = getStrengthLevel(passwordStrength);

        return (
          <FormItem className="space-y-0">
            <FormLabel className="text-sm font-medium text-gray-600">
              {label}
            </FormLabel>
            <div className="relative">
              <FormControl>
                <Input
                  className={cn(
                    "h-10 pr-10 border-gray-200/10 focus:border-primary focus:ring-1 focus:ring-primary transition-all duration-200",
                    error
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  )}
                  placeholder={placeholder}
                  {...field}
                  onChange={handlePasswordChange}
                  type={type === "password" && showPassword ? "text" : type}
                />
              </FormControl>
              {type === "password" && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute cursor-pointer right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOffIcon size={20} />
                  ) : (
                    <EyeIcon size={20} />
                  )}
                </Button>
              )}
            </div>

            {/* Enhanced Password Strength Meter */}
            {showStrengthMeter && type === "password" && field.value && (
              <div className="space-y-1 mt-0.5">
                {/* Segmented strength bar */}
                <div className="flex gap-1 h-1">
                  {[1, 2, 3, 4].map((segment) => {
                    const segmentThreshold = segment * 25;
                    const isActive = passwordStrength >= segmentThreshold - 20;
                    return (
                      <div
                        key={segment}
                        className={cn(
                          "h-full rounded-full transition-all duration-500 flex-1",
                          isActive ? strengthInfo.color : "bg-gray-200",
                          isAnimating && isActive && "animate-pulse"
                        )}
                      />
                    );
                  })}
                </div>

                {/* Password requirements */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <RequirementItem
                    label="At least 8 characters"
                    met={requirements.length}
                  />
                  <RequirementItem
                    label="Uppercase letter"
                    met={requirements.uppercase}
                  />
                  <RequirementItem
                    label="Lowercase letter"
                    met={requirements.lowercase}
                  />
                  <RequirementItem label="Number" met={requirements.number} />
                  <RequirementItem
                    label="Special character"
                    met={requirements.special}
                  />
                  {/* Strength label */}
                  <p
                    className={cn(
                      "text-xs font-semibold text-end transition-colors duration-300",
                      passwordStrength < 30
                        ? "text-red-500"
                        : passwordStrength < 60
                        ? "text-orange-500"
                        : passwordStrength < 80
                        ? "text-green-500"
                        : "text-emerald-500"
                    )}
                  >
                    {strengthInfo.level}
                  </p>
                </div>
              </div>
            )}

            {error && (
              <FormMessage className="text-[11px] text-red-500 -mt-0.5 font-mona-sans">
                {error.message}
              </FormMessage>
            )}
          </FormItem>
        );
      }}
    />
  );
};

// Password requirement item component
const RequirementItem = ({ label, met }: { label: string; met: boolean }) => (
  <div className="flex items-center gap-2">
    {met ? (
      <CheckCircle2 className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-gray-400" />
    )}
    <span
      className={cn(
        "text-xs transition-colors duration-300",
        met ? "text-green-700" : "text-gray-500"
      )}
    >
      {label}
    </span>
  </div>
);

export default FormField;
