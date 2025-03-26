import React from "react";

// UI components imports
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

// FormField props
interface FormFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "password" | "file";
}

/**
 * FormField component
 * @returns FormField component
 */
const FormField = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  type,
}: FormFieldProps<T>) => (
  <Controller
    control={control}
    name={name}
    render={({ field }) => (
      <FormItem>
        <FormLabel className="label">{label}</FormLabel>
        <FormControl>
          <Input
            className="input"
            placeholder={placeholder}
            {...field}
            type={type}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

export default FormField;
